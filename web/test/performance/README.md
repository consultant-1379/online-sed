
# How to use K6 to run performance testing

## Installation

    See https://k6.io/docs/get-started/installation/


## Execution example for 100 VUs (virtual users), over 300 seconds

    # cd web/test/performance
    # k6 run --vus 100 --duration 300s k6_validation_test.js


## Results sample

     ....
     data_received..................: 5.5 MB 313 kB/s
     data_sent......................: 9.1 MB 521 kB/s
     http_req_blocked...............: avg=2.01ms   min=0s      med=7.72µs  max=446.47ms p(90)=2.07ms   p(95)=7.26ms
     http_req_connecting............: avg=1.83ms   min=0s      med=0s      max=446.28ms p(90)=1.54ms   p(95)=6.84ms
     http_req_duration..............: avg=2.42s    min=0s      med=2.77s   max=5.79s    p(90)=5.15s    p(95)=5.24s
       { expected_response:true }...: avg=3.74s    min=1.01s   med=3.82s   max=5.42s    p(90)=4.95s    p(95)=5.09s
     http_req_failed................: 65.58% ✓ 364       ✗ 191
     http_req_receiving.............: avg=170.74µs min=0s      med=0s      max=30.84ms  p(90)=213.36µs p(95)=267.1µs
     http_req_sending...............: avg=3.39ms   min=0s      med=102.3µs max=573.46ms p(90)=239.46µs p(95)=486.71µs
     http_req_tls_handshaking.......: avg=0s       min=0s      med=0s      max=0s       p(90)=0s       p(95)=0s
     http_req_waiting...............: avg=2.42s    min=0s      med=2.77s   max=5.69s    p(90)=5.14s    p(95)=5.23s
     http_reqs......................: 555    31.78365/s
     iteration_duration.............: avg=3.27s    min=92.31ms med=3.35s   max=6.77s    p(90)=5.92s    p(95)=6.25s
     iterations.....................: 500    28.633919/s
     vus............................: 100    min=100     max=100
     vus_max........................: 100    min=100     max=100

    running (0m17.5s), 000/100 VUs, 500 complete and 100 interrupted iterations
    default ✗ [=>------------------------------------] 100 VUs  0m17.3s/5m0s


## Results interpretation

    See https://k6.io/docs/using-k6/metrics/reference/

    The most important metrics are:

        http_req_failed: failed / successful. Lower % is better
        iterations_duration
        iterations: the second number is the requests per second