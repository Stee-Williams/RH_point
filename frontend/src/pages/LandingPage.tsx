import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AnytypeHero } from '../components/landing/AnytypeHero';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/connexion');
  };

  const handleSecondaryAction = () => {
    navigate('/connexion');
  };

  return (
    <AnytypeHero
      onGetStarted={handleGetStarted}
      onSecondaryAction={handleSecondaryAction}
    />
  );
};
