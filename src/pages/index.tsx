import { type NextPage } from "next";
import { useRouter } from 'next/router';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { useUser } from '@supabase/auth-helpers-react';
import LandingPage from '../components/landing';
import Header from '../components/head';

import { api } from "../utils/api";

export async function getServerSideProps(context) {
    const supabase = createServerSupabaseClient(context);
    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (!session)
    return {
      redirect: {
          destination: '/landing',
          permanent: false,
      },
    }
    return {
      redirect: {
          destination: '/home',
          permanent: false,
      },
    }
}

const Home: NextPage = () => {

  return (
    <>
    </>
  );
};

export default Home;
