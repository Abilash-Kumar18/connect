import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SplashView } from '../components/SplashView';
import { useConnect } from '../context/ConnectContext';

export const SplashPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useConnect();

  const handleEnterApp = (user: string = 'alex', profile?: { name?: string; role?: string }) => {
    login(user, profile);
    sessionStorage.setItem('connect_splash_seen', 'true');
    navigate('/channels');
  };

  return <SplashView onEnter={handleEnterApp} />;
};
