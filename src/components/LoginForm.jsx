import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

const LoginForm = () => {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async () => {
    try {
      console.log('email:', email); // 應該是字串
      console.log('password:', password); // 應該是字串
      await signIn(email, password);
    } catch (error) {
      setErrorMsg(error.message);
    }
  };

  return (
    <>
      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
      <button onClick={handleLogin}>登入</button>
      {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}
    </>
  );
};