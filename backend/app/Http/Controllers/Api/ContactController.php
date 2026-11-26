<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use App\Models\SiteSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class ContactController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        // Honeypot: real visitors never see or fill this field.
        if ($request->filled('website')) {
            return response()->json(['ok' => true]);
        }

        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email:rfc', 'max:190'],
            'desk' => ['nullable', 'in:'.implode(',', array_keys(ContactMessage::DESKS))],
            'message' => ['required', 'string', 'min:5', 'max:5000'],
        ]);

        $msg = ContactMessage::create($data + ['desk' => $data['desk'] ?? 'general', 'ip' => $request->ip()]);

        // Email the right desk when mail is configured; the message is stored either way.
        $settings = SiteSetting::current();
        $to = match ($msg->desk) {
            'invest' => $settings->invest_email,
            'tourism' => $settings->tourism_email,
            default => $settings->email,
        };
        if ($to && config('mail.default') !== 'log') {
            try {
                Mail::raw("From: {$msg->name} <{$msg->email}>\nDesk: ".ContactMessage::DESKS[$msg->desk]."\n\n{$msg->message}", function ($m) use ($to, $msg) {
                    $m->to($to)->replyTo($msg->email, $msg->name)->subject('South Omo portal: new message from '.$msg->name);
                });
            } catch (\Throwable $e) {
                Log::warning('Contact email not sent: '.$e->getMessage());
            }
        }

        return response()->json(['ok' => true], 201);
    }
}
