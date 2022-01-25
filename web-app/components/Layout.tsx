// https://nextjs.org/docs/basic-features/layouts#single-shared-layout-with-custom-app

import Head from 'next/head';
import styles from '../styles/Layout.module.scss';

export default function Layout({ children }: { children: JSX.Element | JSX.Element[] }) {
  return (
    <div className={styles.container}>
      <Head>
        <title>Next.js</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>{children}</main>
      <footer className={styles.footer}>
        <a href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app" target="_blank" rel="noopener noreferrer">
          Powered by Vercel
        </a>
      </footer>
    </div>
  );
}
