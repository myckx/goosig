/*!
 * bench/index.js - GoUO benchmarks for javascript
 * Copyright (c) 2018, Christopher Jeffrey (MIT License).
 * https://github.com/handshake-org/goosig
 *
 * Parts of this software are based on kwantam/libGooPy:
 *   Copyright (c) 2018, Dan Boneh, Riad S. Wahby (Apache License).
 *   https://github.com/kwantam/GooSig
 *
 * Resources:
 *   https://github.com/kwantam/GooSig/blob/master/libGooPy/__main__.py
 */

/* eslint camelcase: "off" */

'use strict';

const {performance} = require('perf_hooks');
const testUtil = require('../test/util');
const Goo = require('../lib/js/goo');
const Native = require('../lib/native/goo');

function main(Goo, nreps) {
  // 4096-bit GoUO
  // 4096-bit RSA GoUO, 2048-bit Signer key
  const gops_4_2_p = new Goo(Goo.AOL2, 2, 3, 2048);
  // 4096-bit RSA GoUO, 4096-bit Signer key
  const gops_4_4_p = new Goo(Goo.AOL2, 2, 3, 4096);
  // 4096-bit RSA GoUO (verification)
  const gops_4_v = new Goo(Goo.AOL2, 2, 3, null);

  // 2048-bit GoUO
  // 2048-bit RSA GoUO, 2048-bit Signer key
  const gops_2_2_p = new Goo(Goo.RSA2048, 2, 3, 2048);
  // 2048-bit RSA GoUO, 4096-bit Signer key
  const gops_2_4_p = new Goo(Goo.RSA2048, 2, 3, 4096);
  // 2048-bit RSA GoUO (verification)
  const gops_2_v = new Goo(Goo.RSA2048, 2, 3, null);

  // Measure times.
  const tests = [
    ['4096-bit RSA GoUO, 2048-bit Signer PK', gops_4_2_p, gops_4_v, 2048],
    ['4096-bit RSA GoUO, 4096-bit Signer PK', gops_4_4_p, gops_4_v, 4096],
    ['2048-bit RSA GoUO, 2048-bit Signer PK', gops_2_2_p, gops_2_v, 2048],
    ['2048-bit RSA GoUO, 4096-bit Signer PK', gops_2_4_p, gops_2_v, 4096]
  ];

  const times = [];

  for (let i = 0; i < tests.length; i++)
    times.push([[], [], []]);

  const runTest = () => {
    const res = new Array(times.length);

    for (const [i, [name, prover, verifier, bits]] of tests.entries()) {
      const msg = Buffer.from(name, 'binary');

      // Random signer modulus.
      const key = testUtil.genKey(bits);

      let start_time, stop_time;

      // Generate the challenge token.
      start_time = performance.now();
      const [s_prime, C1] = prover.challenge(key);
      stop_time = performance.now();
      times[i][0].push(stop_time - start_time);

      // Generate the signature.
      start_time = performance.now();
      const sig = prover.sign(msg, s_prime, C1, key);
      stop_time = performance.now();
      times[i][1].push(stop_time - start_time);

      // Verify the signature.
      start_time = performance.now();
      res[i] = verifier.verify(msg, sig, C1);
      stop_time = performance.now();
      times[i][2].push(stop_time - start_time);
    }

    return res;
  };

  testUtil.runAllTests(nreps, 'end-to-end', [
    [
      runTest,
      'sign_and_verify,4x2,4x4,2x2,2x4'
    ]
  ]);

  for (const [i, [n]] of tests.entries())
    testUtil.showTimingTriple(n, times[i]);
}

{
  let nr = 1;
  let native = false;

  for (let i = 2; i < process.argv.length; i++) {
    const arg = process.argv[i];

    if (/^\d+$/.test(arg))
      nr = arg >>> 0;
    else if (arg === '--native-only')
      native = true;
  }

  if (native) {
    main(Native, nr);
  } else {
    main(Goo, nr);
    main(Native, nr);
  }
}
