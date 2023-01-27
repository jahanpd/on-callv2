import { type NextPage } from "next";
import Head from "next/head";


const Header: NextPage = ({ title, description }) => {
  return (
      <Head>
          <title>{ title }</title>
          <meta name="description" content={ description } />
        <link rel="icon" href="/favicon.ico" />
      </Head>
  )
}

export default Header
