<?php

return [

    'single' => [
        'label' => 'ሰርዝ',
        'modal' => [
            'heading' => ':label ሰርዝ',
            'actions' => [
                'delete' => ['label' => 'ሰርዝ'],
            ],
        ],
        'notifications' => [
            'deleted' => ['title' => 'ተሰርዟል'],
        ],
    ],

    'multiple' => [
        'label' => 'የተመረጡትን ሰርዝ',
        'modal' => [
            'heading' => 'የተመረጡ :label ሰርዝ',
            'actions' => [
                'delete' => ['label' => 'ሰርዝ'],
            ],
        ],
        'notifications' => [
            'deleted' => ['title' => 'ተሰርዟል'],
        ],
    ],

];
