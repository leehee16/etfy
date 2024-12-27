'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import '../../src/styles/auth.css';

interface LoginData {
  id: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [loginData, setLoginData] = useState<LoginData>({
    id: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find((u: any) => 
      u.id === loginData.id && u.password === loginData.password
    );

    if (user) {
      sessionStorage.setItem('currentUser', JSON.stringify(user));
      alert('로그인 성공!');
      router.replace('/main');
    } else {
      alert('아이디 또는 비밀번호가 일치하지 않습니다.');
    }
  };

  const handleSignUp = () => {
    router.push('/signup');
  };

  return (
    <div className="login-container">
      <div className="logo-container">
        <img 
          src="/images/etfytypo2.png" 
          alt="ETF Logo" 
          width={280}
          height={100}
          style={{ objectFit: 'contain' }}
        />
      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>아이디</label>
          <input
            type="text"
            name="id"
            value={loginData.id}
            onChange={handleChange}
            required
            placeholder="아이디를 입력하세요"
          />
        </div>
        <div className="form-group">
          <label>비밀번호</label>
          <input
            type="password"
            name="password"
            value={loginData.password}
            onChange={handleChange}
            required
            placeholder="비밀번호를 입력하세요"
          />
        </div>
        <button type="submit">로그인</button>
        <button type="button" onClick={handleSignUp}>회원가입</button>
      </form>
    </div>
  );
} 