<?php

return [

    'single' => [
        'label' => 'መልስ',
        'modal' => [
            'heading' => ':label መልስ',
            'actions' => [
                'restore' => ['label' => 'መልስ'],
            ],
        ],
        'notifications' => [
            'restored' => ['title' => 'ተመልሷል'],
        ],
    ],

    'multiple' => [
        'label' => 'የተመረጡትን መልስ',
        'modal' => [
            'heading' => 'የተመረጡ :label መልስ',
            'actions' => [
                'restore' => ['label' => 'መልስ'],
            ],
        ],
        'notifications' => [
            'restored' => ['title' => 'ተመልሷል'],
        ],
    ],

];
