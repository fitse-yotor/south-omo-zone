<?php

return [

    'title' => 'ግባ',

    'heading' => 'ወደ መለያዎ ይግቡ',

    'actions' => [
        'request_password_reset' => [
            'label' => 'የይለፍ ቃልዎን ረሱ?',
        ],
    ],

    'form' => [
        'email' => [
            'label' => 'የኢሜይል አድራሻ',
        ],
        'password' => [
            'label' => 'የይለፍ ቃል',
        ],
        'remember' => [
            'label' => 'አስታውሰኝ',
        ],
        'actions' => [
            'authenticate' => [
                'label' => 'ግባ',
            ],
        ],
    ],

    'messages' => [
        'failed' => 'የገቡት መረጃ ትክክል አይደለም።',
    ],

    'notifications' => [
        'throttled' => [
            'title' => 'ብዙ ሙከራ',
            'body' => 'እባክዎ ከ:seconds ሰከንድ በኋላ ይሞክሩ።',
        ],
    ],

];
