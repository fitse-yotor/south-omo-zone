<?php

return [

    'checkbox_list' => [
        'actions' => [
            'deselect_all' => ['label' => 'ሁሉንም አቁም'],
            'select_all' => ['label' => 'ሁሉንም ምረጥ'],
        ],
    ],

    'file_upload' => [
        'editor' => [
            'actions' => [
                'cancel' => ['label' => 'ሰርዝ'],
                'save' => ['label' => 'አስቀምጥ'],
                'zoom_in' => ['label' => 'አቅርብ'],
                'zoom_out' => ['label' => 'አራቅ'],
                'reset' => ['label' => 'ዳግም ጀምር'],
                'flip_horizontal' => ['label' => 'አግድም ገልብጥ'],
                'flip_vertical' => ['label' => 'ቁልቁል ገልብጥ'],
            ],
            'aspect_ratios' => [
                'label' => 'ጥምርታ',
                'no_fixed' => ['label' => 'ነጻ'],
            ],
        ],
    ],

    'repeater' => [
        'actions' => [
            'add' => ['label' => ':label ጨምር'],
            'add_between' => ['label' => 'መካከል አስገባ'],
            'delete' => ['label' => 'ሰርዝ'],
            'clone' => ['label' => 'ቅጂ'],
            'reorder' => ['label' => ' አዙር'],
            'move_down' => ['label' => 'ወደ ታች'],
            'move_up' => ['label' => 'ወደ ላይ'],
            'collapse' => ['label' => 'ሰብስብ'],
            'expand' => ['label' => 'ዘርጋ'],
            'collapse_all' => ['label' => 'ሁሉ ሰብስብ'],
            'expand_all' => ['label' => 'ሁሉ ዘርጋ'],
        ],
    ],

    'select' => [
        'actions' => [
            'create_option' => [
                'label' => 'አዲስ',
                'modal' => [
                    'heading' => 'ፍጠር',
                    'actions' => [
                        'create' => ['label' => 'ፍጠር'],
                        'create_another' => ['label' => 'ፍጠርና ሌላ'],
                    ],
                ],
            ],
            'edit_option' => [
                'label' => 'አርትም',
                'modal' => [
                    'heading' => 'አርትም',
                    'actions' => [
                        'save' => ['label' => 'አስቀምጥ'],
                    ],
                ],
            ],
        ],
        'boolean' => ['true' => 'አዎ', 'false' => 'አይ'],
        'loading_message' => 'እየጫነ ነው...',
        'max_items_message' => ':count ብቻ መምረጥ ይቻላል።',
        'no_search_results_message' => 'ምንም አማራጭ አልተገኘም።',
        'placeholder' => 'ምረጥ...',
        'searching_message' => 'እየፈለገ ነው...',
        'search_prompt' => 'ለፍለጋ ይጻፉ...',
    ],

    'text_input' => [
        'actions' => [
            'hide_password' => ['label' => 'የይለፍ ቃልን ደብቅ'],
            'show_password' => ['label' => 'የይለፍ ቃልን አሳይ'],
        ],
    ],

    'radio' => [
        'boolean' => ['true' => 'አዎ', 'false' => 'አይ'],
    ],

    'toggle_buttons' => [
        'boolean' => ['true' => 'አዎ', 'false' => 'አይ'],
    ],

    'wizard' => [
        'actions' => [
            'previous_step' => ['label' => 'ተመለስ'],
            'next_step' => ['label' => 'ቀጥል'],
        ],
    ],

    'key_value' => [
        'actions' => [
            'add' => ['label' => 'ረድፍ ጨምር'],
            'delete' => ['label' => 'ረድፍ ሰርዝ'],
            'reorder' => ['label' => 'ደርድር'],
        ],
        'fields' => [
            'key' => ['label' => 'ቁልፍ'],
            'value' => ['label' => 'እሴት'],
        ],
    ],

    'tags_input' => [
        'placeholder' => 'አዲስ ስያሜ',
    ],

    'markdown_editor' => [
        'toolbar_buttons' => [
            'bold' => 'ደፋር',
            'italic' => 'ዘመማ',
            'link' => 'ሊንክ',
            'heading' => 'ርዕስ',
            'bullet_list' => 'ዝርዝር',
            'ordered_list' => 'ቁጥር ዝርዝር',
            'undo' => 'ቀድሞ',
            'redo' => 'ደግም',
        ],
    ],

];
