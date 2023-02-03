import Head from "next/head";

type Props = {
    title: string
    description: string
}

const Header = ({ title, description }: Props) => {
  return (
      <Head>
          <title>{ title }</title>
          <meta name="description" content={ description } />
          <link rel="icon" href="/favicon.ico" />
          <link
              rel="stylesheet"
              href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.1/css/all.min.css"
              integrity="sha512-MV7K8+y+gLIBoVD59lQIYicR65iaqukzvf/nwasF0nqhPay5w/9lJmVM2hMDcnK1OnMGCdVK+iQrJ7lzPJQd1w=="
              crossOrigin="anonymous"
              referrerPolicy="no-referrer"
          />
      </Head>
  )
}

export default Header
