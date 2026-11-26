<?php

namespace App\Models;

use App\Models\Concerns\Bilingual;
use Illuminate\Database\Eloquent\Model;

/** The Chief Administrator's message (one record). Paragraphs are separated by a blank line. */
class LeaderMessage extends Model
{
    use Bilingual;

    protected $guarded = ['id'];

    public static function current(): ?self
    {
        return static::query()->latest('id')->first();
    }

    public function toPortal(): array
    {
        return [
            'name' => $this->bi('name'),
            'title' => $this->bi('title'),
            'photo' => $this->photo ? self::imageRef($this->photo) : '',
            'video' => (string) $this->video_url,
            'excerpt' => $this->bi('excerpt'),
            'message' => $this->biParagraphs('message'),
        ];
    }
}
