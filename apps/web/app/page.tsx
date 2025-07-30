import { auth } from '@nxnext/auth/server';
import { redirect } from 'next/navigation';

export default async function Component() {
  const session = await auth();
  if (!session) {
    redirect('/api/auth/signin');
  }

  return <div className="flex flex-col min-h-[100dvh]">Some content</div>;
}
