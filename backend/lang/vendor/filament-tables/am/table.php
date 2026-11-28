<?php

return [

    'column_toggle' => [
        'heading' => 'አምዶች',
    ],

    'columns' => [
        'actions' => ['label' => 'ተግባር|ተግባሮች'],
        'text' => [
            'actions' => [
                'collapse_list' => ':count ያነሱ አሳይ',
                'expand_list' => ':count ተጨማሪ አሳይ',
            ],
            'more_list_items' => 'እና :count ተጨማሪ',
        ],
    ],

    'fields' => [
        'bulk_select_page' => ['label' => 'ሁሉንም ምረጥ/ምርጫ አንሳ።'],
        'bulk_select_record' => ['label' => ':key ን ምረጥ/ምርጫ አንሳ።'],
        'bulk_select_group' => ['label' => ':title ቡድን ምረጥ/ምርጫ አንሳ።'],
        'search' => [
            'label' => 'ፈልግ',
            'placeholder' => 'ፈልግ...',
            'indicator' => 'ፍለጋ',
        ],
    ],

    'summary' => [
        'heading' => 'ማጠቃለያ',
        'subheadings' => [
            'all' => 'ሁሉም :label',
            'group' => ':group ማጠቃለያ',
            'page' => 'ይህ ገጽ',
        ],
        'summarizers' => [
            'average' => ['label' => 'አማካይ'],
            'count' => ['label' => 'ብዛት'],
            'sum' => ['label' => 'ድምር'],
        ],
    ],

    'actions' => [
        'disable_reordering' => ['label' => 'ደርደርን ጨርስ'],
        'enable_reordering' => ['label' => 'እንደገና ደርድር'],
        'filter' => ['label' => 'አጣርይ'],
        'group' => ['label' => 'ቡድን አድርግ'],
        'open_bulk_actions' => ['label' => 'የጅምላ ተግባሮች'],
        'toggle_columns' => ['label' => 'አምዶችን አሳይ/ደብቅ'],
    ],

    'empty' => [
        'heading' => 'ምንም :model የለም',
        'description' => 'ለመጀመር :model ፍጠር።',
    ],

    'filters' => [
        'actions' => [
            'apply' => ['label' => 'አጣሪዎችን ተግብር'],
            'remove' => ['label' => 'አጣሪ አስወግድ'],
            'remove_all' => [
                'label' => 'ሁሉንም አጣሪዎች አስወግድ',
                'tooltip' => 'ሁሉንም አጣሪዎች አስወግድ',
            ],
            'reset' => ['label' => 'ዳግም ጀምር'],
        ],
        'heading' => 'አጣሪዎች',
        'indicator' => 'ንቁ አጣሪዎች',
        'multi_select' => ['placeholder' => 'ሁሉም'],
        'select' => ['placeholder' => 'ሁሉም'],
        'trashed' => [
            'label' => 'የተሰረዙ መዝገቦች',
            'only_trashed' => 'የተሰረዙ ብቻ',
            'with_trashed' => 'ከተሰረዙ ጋር',
            'without_trashed' => 'ያልተሰረዙ ብቻ',
        ],
    ],

    'grouping' => [
        'fields' => [
            'group' => ['label' => 'ቡድን', 'placeholder' => 'ቡድን ምረጥ'],
            'direction' => [
                'label' => 'አቅጣጫ',
                'options' => ['asc' => 'ከታች ወደ ላይ', 'desc' => 'ከላይ ወደ ታች'],
            ],
        ],
    ],

    'reorder_indicator' => 'ወደ ተፈለገ ቦታ ጎትቶ ጣል።',

    'selection_indicator' => [
        'selected_count' => '1 መዝገብ ተመርጧል|:count መዝገቦች ተመርጠዋል',
        'actions' => [
            'select_all' => ['label' => 'ሁሉንም :count ምረጥ'],
            'deselect_all' => ['label' => 'ምርጫ ሁሉ አንሳ'],
        ],
    ],

    'sorting' => [
        'fields' => [
            'column' => ['label' => 'መደርደሪያ'],
            'direction' => [
                'label' => 'አቅጣጫ',
                'options' => ['asc' => 'ከታች ወደ ላይ', 'desc' => 'ከላይ ወደ ታች'],
            ],
        ],
    ],

];
