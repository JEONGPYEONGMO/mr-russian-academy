import { NextRequest, NextResponse } from 'next/server';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

export async function POST(req: NextRequest) {
  try {
    const { base64, filename } = await req.json() as { base64: string; filename: string };

    const backupDir = join(process.cwd(), 'backups');
    if (!existsSync(backupDir)) mkdirSync(backupDir, { recursive: true });

    const buffer = Buffer.from(base64, 'base64');
    const filepath = join(backupDir, filename);
    writeFileSync(filepath, buffer);

    return NextResponse.json({ success: true, filename, path: filepath });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
