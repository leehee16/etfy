import { useState } from 'react';
import type { NextPage } from 'next';

interface LoginData {
  id: string;
  password: string;
}

const Login: NextPage = () => {
  const [loginData, setLoginData] = useState<LoginData>({
    id: '',
    password: '',
  });

  // 입력 필드 변경 핸들러
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 로그인 제출 핸들러
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 로컬 스토리지에서 사용자 데이터 확인
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find((u: any) => 
      u.id === loginData.id && u.password === loginData.password
    );

    if (user) {
      // 로그인 성공 시 세션 스토리지에 로그인 상태 저장
      sessionStorage.setItem('currentUser', JSON.stringify(user));
      alert('로그인 성공!');
      window.location.href = '/'; // 메인 페이지로 이동
    } else {
      alert('아이디 또는 비밀번호가 일치하지 않습니다.');
    }
  };

  // 회원가입 페이지로 이동
  const handleSignUp = () => {
    window.location.href = '/signup';
  };

  return (
    <div className="login-container">
      <h2>로그인</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>아이디:</label>
          <input
            type="text"
            name="id"
            value={loginData.id}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>비밀번호:</label>
          <input
            type="password"
            name="password"
            value={loginData.password}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">로그인</button>
        <button type="button" onClick={handleSignUp}>회원가입</button>
      </form>
    </div>
  );
};

export default Login; 