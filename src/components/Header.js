import React, { useState, useRef, useEffect } from 'react';
import { gql, useLazyQuery, useMutation, useQuery } from '@apollo/client';

const GET_CURRENT_LOGGED_IN_USER = gql`
  query authenticate {
    authenticatedItem {
      __typename
      ... on User {
        id
        name
      }
    }
  }
`;

const LOGIN_USER = gql`
  mutation authenticate($email: String!, $password: String!) {
    authenticateUserWithPassword(email: $email, password: $password) {
      ... on UserAuthenticationWithPasswordSuccess {
        item {
          id
          name
        }
      }
      ... on UserAuthenticationWithPasswordFailure {
        type: __typename
        message
      }
    }
  }
`;

const LOGOUT_USER = gql`
  mutation endUserSession {
    endSession
  }
`;

export function Header() {
  const [isLoading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const [getCurrentLoggedInUser] = useLazyQuery(GET_CURRENT_LOGGED_IN_USER, {
    onCompleted: res => {
      if (res?.authenticatedItem?.id) {
        setUser(res.authenticatedItem);
      }
      setLoading(false);
    }
  });

  const [authenticateUser, { data: loginData }] = useMutation(LOGIN_USER, {
    onCompleted: res => {
      if(res?.authenticateUserWithPassword?.item?.id){
        window.location.reload();
      }
    }
  });

  const [endUserSession] = useMutation(LOGOUT_USER, {
    onCompleted: () => {
      window.location.reload();
    }
  });

  useEffect(() => {
    getCurrentLoggedInUser()
  }, []);

  const login = () => {
    if (emailRef.current && passwordRef.current) {
      const email = emailRef.current.value;
      const password = passwordRef.current.value;

      authenticateUser({
        variables: { email, password }
      });

    }
  };

  const logout = () => {
    endUserSession();
  };

  if (isLoading) {
    // empty div to prevent layout jump
    return <div style={{ height: '2rem' }}>Loading..</div>;
  }

  if (!user) {
    return (
      <>
        <div style={{ height: '2rem', display: 'flex', gap: '1em', alignItems: 'flex-end' }}>
          <label>
            email: <input name="email" type="email" ref={emailRef} placeholder="bruce@email.com" />
          </label>
          <label>
            password:{' '}
            <input name="password" type="password" ref={passwordRef} placeholder="passw0rd" />
          </label>
          <button onClick={login}>login</button>
        </div>
        {loginData?.authenticateUserWithPassword.type === 'UserAuthenticationWithPasswordFailure' && <div style={{ color: 'red' }}>{`Error: ${loginData?.authenticateUserWithPassword.message}`}</div>}
      </>
    );
  }

  return (
    <div style={{ height: '2rem', display: 'flex', justifyContent: 'space-between' }}>
      <div>Hello, {user.name}!</div>
      <button onClick={logout}>logout</button>
    </div>
  );
}