import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface UserData {
  name: string;
  age: string;
  id: string;
  password: string;
}

const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData>({
    name: '',
    age: '',
    id: '',
    password: '',
  });

  // 입력 필드 변경 핸들러
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 회원가입 제출 핸들러
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 로컬 스토리지에 사용자 데이터 저장
    const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
    
    // 아이디 중복 체크
    if (existingUsers.some((user: UserData) => user.id === userData.id)) {
      alert('이미 존재하는 아이디입니다.');
      return;
    }

    existingUsers.push(userData);
    localStorage.setItem('users', JSON.stringify(existingUsers));
    
    alert('회원가입이 완료되었습니다.');
    navigate('/login'); // 로그인 페이지로 이동
  };

  return (
    <div className="signup-container">
      <h2>회원가입</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>이름:</label>
          <input
            type="text"
            name="name"
            value={userData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>나이:</label>
          <input
            type="number"
            name="age"
            value={userData.age}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>아이디:</label>
          <input
            type="text"
            name="id"
            value={userData.id}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>비밀번호:</label>
          <input
            type="password"
            name="password"
            value={userData.password}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">가입하기</button>
      </form>
    </div>
  );
};

export default SignUp; 