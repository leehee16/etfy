import React from 'react';
import type { AppProps } from 'next/app';
import '../src/styles/auth.css';

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default MyApp; 