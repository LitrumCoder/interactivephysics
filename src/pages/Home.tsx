import React from 'react';
import { Typography, Card, Space, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { ExperimentOutlined, BookOutlined, BarChartOutlined } from '@ant-design/icons';
import './Home.css';

const { Title, Paragraph } = Typography;

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <div className="hero-section">
        <Title className="hero-title">Добро пожаловать в мир физики</Title>
        <Paragraph className="hero-subtitle">
          Исследуйте законы физики через интерактивные эксперименты и наглядные примеры
        </Paragraph>
      </div>

      <div className="sections-row">
        <Card className="section-card" hoverable onClick={() => navigate('/experiments')}>
          <ExperimentOutlined className="section-icon" />
          <Title level={3}>Эксперименты</Title>
          <Paragraph>
            Проводите виртуальные эксперименты и наблюдайте за физическими явлениями в реальном времени
          </Paragraph>
        </Card>

        <Card className="section-card" hoverable onClick={() => navigate('/theory')}>
          <BookOutlined className="section-icon" />
          <Title level={3}>Теория</Title>
          <Paragraph>
            Изучайте основные законы физики с подробными объяснениями и примерами
          </Paragraph>
        </Card>

        <Card className="section-card" hoverable onClick={() => navigate('/kinematics')}>
          <BarChartOutlined className="section-icon" />
          <Title level={3}>Кинематика</Title>
          <Paragraph>
            Анализируйте движение тел с помощью интерактивных графиков и визуализаций
          </Paragraph>
        </Card>
      </div>

      <div className="site-info">
        <Title level={2}>О проекте</Title>
        <Paragraph>
          Наш проект создан для того, чтобы сделать изучение физики увлекательным и наглядным. 
          Здесь вы найдете интерактивные эксперименты, подробные объяснения физических законов 
          и возможность визуализировать сложные физические процессы.
        </Paragraph>
        <Button 
          type="primary" 
          size="large"
          onClick={() => navigate('/experiments')}
          className="start-button"
        >
          Начать изучение
        </Button>
      </div>
    </div>
  );
};

export default Home; 