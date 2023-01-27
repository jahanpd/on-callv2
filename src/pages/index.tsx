import type { GetServerSideProps } from 'next';
import { type NextPage } from "next";
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

export const getServerSideProps: GetServerSideProps = async (context) => {
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
