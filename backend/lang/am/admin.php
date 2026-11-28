<?php

/**
 * Custom Amharic strings for the South Omo Zone admin panel.
 * Used via __('admin.key') or trans('admin.key').
 */
return [

    // ── Dashboard ───────────────────────────────────────────────
    'dashboard' => [
        'title_zone'   => 'ደቡብ ኦሞ ዞን · አስተዳደር',
        'title_woreda' => 'እንኳን ደህና መጡ',
        'sub_woreda'   => 'ወረዳ · ሪፖርቶችን ያስገቡ እና የእቅድ ሂደቱን ይከታተሉ',
        'sub_zone'     => 'የዞን ፖርታል · ሪፖርቶች፣ እቅዶች እና ይዘቶች',
    ],

    // ── Navigation groups ────────────────────────────────────────
    'nav' => [
        'woreda_portal' => 'የወረዳ ፖርታል',
        'notice_board'  => 'ማስታወቂያ ሰሌዳ',
        'home_page'     => 'መነሻ ገጽ',
        'investment'    => 'ኢንቨስትመንት',
        'zone_tourism'  => 'ዞን እና ቱሪዝም',
        'tourism_map'   => 'የቱሪዝም ካርታ',
        'settings'      => 'ቅንብሮች',
    ],

    // ── Resources ────────────────────────────────────────────────
    'resources' => [
        'woreda_reports'  => 'የወረዳ ሪፖርቶች',
        'zone_plans'      => 'የዞን እቅዶች',
        'users'           => 'ሰራተኞች እና ወረዳ መለያዎች',
        'woredas'         => 'ወረዳዎች',
        'sectors'         => 'ዘርፎች',
        'opportunities'   => 'የኢንቨስትመንት ዕድሎች',
        'attractions'     => 'መስህቦች',
        'announcements'   => 'ማስታወቂያዎች',
        'contact_messages'=> 'መልዕክቶች',
        'facts'           => 'እውነታዎች',
        'leader_messages' => 'የአመራር መልዕክት',
        'hero_slides'     => 'ዋና ምስሎች',
        'journeys'        => 'ጉዞዎች',
        'itineraries'     => 'የጉዞ መርሃ ግብሮች',
        'markets'         => 'ገበያዎች',
        'road_statuses'   => 'የመንገድ ሁኔታ',
        'route_stops'     => 'የመንገድ ቆሚያዎች',
        'peoples'         => 'ህዝቦች',
        'guide_items'     => 'መመሪያ',
        'labels'          => 'ስያሜዎች',
        'photo_credits'   => 'የፎቶ ምንጮች',
        'site_settings'   => 'የጣቢያ ቅንብሮች',
    ],

    // ── Reports ──────────────────────────────────────────────────
    'reports' => [
        'submit'         => 'ሪፖርት ያስገቡ',
        'title'          => 'ርዕስ',
        'period'         => 'የሪፖርት ጊዜ',
        'summary'        => 'ማጠቃለያ',
        'achievements'   => 'ስኬቶች',
        'challenges'     => 'ችግሮች',
        'next_steps'     => 'ቀጣይ እርምጃዎች',
        'attachment'     => 'ፋይል አያይዝ',
        'zone_feedback'  => 'የዞን አስተያየት',
        'status' => [
            'submitted' => 'ቀርቧል',
            'reviewed'  => 'በግምገማ ላይ',
            'approved'  => 'ፀድቋል',
            'rejected'  => 'ማሻሻያ ያስፈልጋል',
        ],
    ],

    // ── Plans ────────────────────────────────────────────────────
    'plans' => [
        'title'       => 'ርዕስ',
        'period'      => 'ጊዜ',
        'description' => 'መግለጫ',
        'start_date'  => 'መጀመሪያ ቀን',
        'due_date'    => 'ማብቂያ ቀን',
        'status' => [
            'draft'  => 'ረቂቅ',
            'active' => 'ንቁ',
            'closed' => 'ተዘጋ',
        ],
        'progress'    => 'ሂደት',
        'update_progress' => 'ሂደቱን ያዘምኑ',
        'tasks'       => 'ተግባሮች',
        'woredas'     => 'ወረዳዎች',
    ],

    // ── Stats ────────────────────────────────────────────────────
    'stats' => [
        'pending_reports'    => 'በመጠባበቅ ላይ ያሉ ሪፖርቶች',
        'active_plans'       => 'ንቁ እቅዶች',
        'woreda_accounts'    => 'የወረዳ መለያዎች',
        'open_vacancies'     => 'ክፍት የሥራ ቦታዎች',
        'open_tenders'       => 'ክፍት ጨረታዎች',
        'published_opps'     => 'የወጡ ዕድሎች',
        'unread_messages'    => 'ያልተነበቡ መልዕክቶች',
        'my_reports'         => 'የእኔ ሪፖርቶች',
        'pending_feedback'   => 'አስተያየት በሚጠበቅ ላይ',
        'approved_reports'   => 'የፀደቁ ሪፖርቶች',
    ],

    // ── Roles ────────────────────────────────────────────────────
    'roles' => [
        'admin'   => 'አስተዳዳሪ',
        'editor'  => 'የይዘት አርታዒ',
        'notices' => 'ማስታወቂያ ብቻ',
        'woreda'  => 'የወረዳ መለያ',
    ],

    // ── Common UI ────────────────────────────────────────────────
    'save'   => 'አስቀምጥ',
    'cancel' => 'ሰርዝ',
    'delete' => 'ሰርዝ',
    'edit'   => 'አርትም',
    'view'   => 'ዝርዝር',
    'create' => 'ፍጠር',
    'back'   => 'ተመለስ',
    'search' => 'ፈልግ',
    'filter' => 'አጣርይ',
    'yes'    => 'አዎ',
    'no'     => 'አይ',
    'active' => 'ንቁ',
    'inactive' => 'ንቁ አይደለም',
    'language' => 'ቋንቋ',
];
