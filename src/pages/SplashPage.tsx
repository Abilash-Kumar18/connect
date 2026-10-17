import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SplashView } from '../components/SplashView';

export const SplashPage: React.FC = () => {
  const navigate = useNavigate();

  const handleEnterApp = () => {
    sessionStorage.setItem('connect_splash_seen', 'true');
    navigate('/channels');
  };

  return <SplashView onEnter={handleEnterApp} />;
};
