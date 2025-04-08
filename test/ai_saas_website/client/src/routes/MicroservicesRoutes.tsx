import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MicroservicesPage from '@/pages/MicroservicesPage';
import MicroserviceDetailPage from '@/pages/MicroserviceDetailPage';

const MicroservicesRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<MicroservicesPage />} />
      <Route path="/:id" element={<MicroserviceDetailPage />} />
    </Routes>
  );
};

export default MicroservicesRoutes;
