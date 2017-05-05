import fs from 'fs'

export const ali = {
    /* 应用RSA私钥 请勿忘记 ----BEGIN RSA PRIVATE KEY----- 与 -----END RSA PRIVATE KEY-----  */
    'merchantPrivateKey': `-----BEGIN PRIVATE KEY-----
MIICdgIBADANBgkqhkiG9w0BAQEFAASCAmAwggJcAgEAAoGBAKFai5gaFbzBeX6p
bOSrtC0Iroy+h0P72OItfUnAFasTunCWc+4BU1WjsJCaCSzEhwV3Lca1rOArlNiB
rrbwS/UVBzZtja8I0HPGNSJ7/VwnaOzPSrSAuiVkhFdTtMU5pE6LQIevYmaoxC9L
EIXCrEKvu2sg+A3YSeqEJuhPLw6zAgMBAAECgYEAoVbDfJygnbQsAx3wd5rFN76V
osAkyzK5xDdOLv916zF33Hpkg1kp9dkOhRixEeWVST7JNAeXTDPnyrGpfN08ZMZd
9y7aqQEgkWrsYpz2j9yJJmbRZyBPrC14yh4KvSZhoO0iLWbYuj6hRH2c0bEocUEK
lY7BnC+9x+YieMc5lfECQQDNySKJqkGXVhoGk6tOXA5BaVOTLsmXXcqbuD4/oOXU
gRoqcg6TcxcguvAYP1PdUkORdt2Vg07EQqnx1HWydkfbAkEAyLndwgLsMyqPpTEl
cq96WcTZJmOwXoDYAhk//wGa2K2uxm9at1E3WjTW7eaKAhhsbOtAM5rc4UJLFZyk
Jf4YCQJATIspDp3Gof0D1zhsOsxg/RGpZZC8qVHYwA1LEi3N7zpKOkmMhGoFy0Xd
cpdzoVotCdl12FwsGzJUtj/5u3TliwJAa3kpRUHvWg4Fz3sbA+b06a++XRGvU0pF
XgpK+6zOTgngtJrWxaSUsJXuJn7zkd+l3kOvonHepjWqoi22rij4kQJAdGo4sLo7
EVU2KbnFDoKco6AMyNMjl2NhfzpPHW2x7buFGg3DB+3VtBe3o9P4n6EYyeMa/YeO
a2/50EQ0nG03/w==
-----END PRIVATE KEY-----`,

    /* 支付宝授权表名 */
    'tableName': 'TBL_ALI_TOKEN',
    /* 商户信息表 */
    'storeTableName': 'TBL_STORECODE'
}