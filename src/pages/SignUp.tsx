import React, { useState } from 'react';
import { useRouter } from 'next/router';

interface UserData {
  name: string;
  age: string;
  id: string;
  password: string;
}

const SignUp = () => {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData>({
    name: '',
    age: '',
    id: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
    
    if (existingUsers.some((user: UserData) => user.id === userData.id)) {
      alert('이미 존재하는 아이디입니다.');
      return;
    }

    existingUsers.push(userData);
    localStorage.setItem('users', JSON.stringify(existingUsers));
    
    alert('회원가입이 완료되었습니다.');
    router.push('/login');
  };

  const handleLogin = () => {
    router.push('/login');
  };

  return (
    <div className="signup-container">
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
          <label>이름</label>
          <input
            type="text"
            name="name"
            value={userData.name}
            onChange={handleChange}
            required
            placeholder="이름을 입력하세요"
          />
        </div>
        <div className="form-group">
          <label>나이</label>
          <input
            type="number"
            name="age"
            value={userData.age}
            onChange={handleChange}
            required
            placeholder="나이를 입력하세요"
          />
        </div>
        <div className="form-group">
          <label>아이디</label>
          <input
            type="text"
            name="id"
            value={userData.id}
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
            value={userData.password}
            onChange={handleChange}
            required
            placeholder="비밀번호를 입력하세요"
          />
        </div>
        <button type="submit">가입하기</button>
        <button type="button" onClick={handleLogin}>로그인하기</button>
      </form>
    </div>
  );
};

export default SignUp; 