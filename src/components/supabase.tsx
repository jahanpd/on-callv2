import { type NextPage } from "next";
import { Auth, ThemeSupa } from '@supabase/auth-ui-react';
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';
import { useEffect, useState } from 'react';

const AuthPage: NextPage = () => {
  const supabaseClient = useSupabaseClient();
  const user = useUser();

  if (!user) {
    return (
        <Auth
        redirectTo="http://localhost:3000/home"
        appearance={{ theme: ThemeSupa }}
        supabaseClient={supabaseClient}
        socialLayout="horizontal"
        theme="dark"
        />
    )
  }
  else {
    return (
        <button
            className = "bg-slate-100 rounded-lg p-5 hover:bg-sky-200"
            onClick={() => supabaseClient.auth.signOut()}>Sign out</button>
        )
  }
}

export default AuthPage;
