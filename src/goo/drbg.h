/*!
 * drbg.c - hmac-drbg for C
 * Copyright (c) 2018, Christopher Jeffrey (MIT License).
 * https://github.com/handshake-org/goosig
 *
 * Resources:
 *   https://tools.ietf.org/html/rfc6979
 *   https://csrc.nist.gov/publications/detail/sp/800-90a/archive/2012-01-23
 */

#ifndef _GOOSIG_DRBG_H
#define _GOOSIG_DRBG_H

#include <stdlib.h>
#include "sha256.h"
#include "hmac.h"

#if defined(__cplusplus)
extern "C" {
#endif

#define GOO_RESEED_INTERVAL 0x1000000000000ull

typedef struct goo_drbg_s {
  goo_hmac_t kmac;
  unsigned char K[GOO_HASH_SIZE];
  unsigned char V[GOO_HASH_SIZE];
  unsigned long long rounds;
} goo_drbg_t;

void
goo_drbg_init(goo_drbg_t *drbg, const unsigned char *seed, size_t seed_len);

void
goo_drbg_reseed(goo_drbg_t *drbg, const unsigned char *seed, size_t seed_len);

void
goo_drbg_generate(goo_drbg_t *drbg, unsigned char *out, size_t len);

#if defined(__cplusplus)
}
#endif

#endif
