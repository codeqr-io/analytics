import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex flex-col justify-between items-center p-24 min-h-screen">
      <div className="flex justify-center items-center text-sm max-w-[1100px] w-full z-10 font-mono">
        <p className="relative m-0 p-4 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100">
          CodeQR Analytics Example App
        </p>
        <div className="flex justify-center items-center gap-2">
          <a
            href="https://vercel.com?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
            className="flex justify-center items-center gap-2"
          >
            By{' '}
            <Image
              src="/vercel.svg"
              alt="Vercel Logo"
              className="dark:invert"
              width={100}
              height={24}
              priority
            />
          </a>
        </div>
      </div>

      <div className="flex justify-center items-center relative p-16">
        <Image
          className="relative dark:drop-shadow-[0_0_0.3rem_#ffffff70] dark:invert"
          src="/next.svg"
          alt="Next.js Logo"
          width={180}
          height={37}
          priority
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 max-w-[1100px] w-full">
        <Link
          href="/conversion-test"
          className="group p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 transition-all hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
        >
          <h2 className="font-semibold mb-3 text-gray-900 dark:text-gray-100">
            Conversion Tracking{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1">
              -&gt;
            </span>
          </h2>
          <p className="m-0 text-gray-600 dark:text-gray-300 text-sm leading-6 max-w-[30ch]">
            Test lead and sale conversion tracking with interactive forms.
          </p>
        </Link>

        <Link
          href="/outbound"
          className="group p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 transition-all hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
        >
          <h2 className="font-semibold mb-3 text-gray-900 dark:text-gray-100">
            Outbound Links{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1">
              -&gt;
            </span>
          </h2>
          <p className="m-0 text-gray-600 dark:text-gray-300 text-sm leading-6 max-w-[30ch]">
            Test outbound domain tracking and link parameter injection.
          </p>
        </Link>

        <a
          href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          className="group p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 transition-all hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className="font-semibold mb-3 text-gray-900 dark:text-gray-100">
            Next.js Docs{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1">
              -&gt;
            </span>
          </h2>
          <p className="m-0 text-gray-600 dark:text-gray-300 text-sm leading-6 max-w-[30ch]">
            Find in-depth information about Next.js features and API.
          </p>
        </a>

        <a
          href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          className="group p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 transition-all hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className="font-semibold mb-3 text-gray-900 dark:text-gray-100">
            Deploy{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1">
              -&gt;
            </span>
          </h2>
          <p className="m-0 text-gray-600 dark:text-gray-300 text-sm leading-6 max-w-[30ch]">
            Instantly deploy your Next.js site to a shareable URL with Vercel.
          </p>
        </a>
      </div>
    </main>
  );
}
