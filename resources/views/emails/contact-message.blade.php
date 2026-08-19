<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pesan kontak baru</title>
</head>
<body style="font-family: Arial, sans-serif; color: #17324d; line-height: 1.6;">
    <h2>Pesan kontak baru dari website</h2>

    <p><strong>Nama:</strong> {{ $contact->first_name }} {{ $contact->last_name }}</p>
    <p><strong>Email:</strong> {{ $contact->email }}</p>
    <p><strong>Telepon:</strong> {{ $contact->phone ?: '-' }}</p>

    <h3>Pesan</h3>
    <p style="white-space: pre-line;">{{ $contact->message }}</p>
</body>
</html>
