import React, { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Layout, Menu, Typography, Button, Switch, Space, Dropdown, ConfigProvider, Modal } from 'antd';
import { HomeOutlined, ExperimentOutlined, BookOutlined, LineChartOutlined, SettingOutlined, CarOutlined, ExperimentFilled } from '@ant-design/icons';
import { FireOutlined, BankOutlined } from '@ant-design/icons';
import Home from './pages/Home';
import Experiments from './pages/Experiments';
import Theory from './pages/Theory';
import PhysicsMap from './pages/PhysicsMap';
import Kinematics from './pages/Kinematics';
import './App.css';

const { Content, Footer } = Layout;
const { Title } = Typography;

const App: React.FC = () => {
  const location = useLocation();
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [isCandleLit, setIsCandleLit] = useState(false);
  const [isChurchModalVisible, setIsChurchModalVisible] = useState(false);
  const [isChurchGlowing, setIsChurchGlowing] = useState(false);
  const currentPath = location.pathname;

  const getSelectedKey = () => {
    switch (currentPath) {
      case '/':
        return '1';
      case '/experiments':
        return '2';
      case '/theory':
        return '3';
      case '/physics-map':
        return '4';
      case '/kinematics':
        return '5';
      default:
        return '1';
    }
  };

  const handleThemeChange = (checked: boolean) => {
    setIsDarkTheme(checked);
    document.body.className = checked ? 'dark-theme' : 'light-theme';
  };

  const handleCandleClick = () => {
    setIsCandleLit(!isCandleLit);
    setIsChurchModalVisible(true);
  };

  const handleChurchModalClose = () => {
    setIsChurchModalVisible(false);
    setIsChurchGlowing(false);
  };

  const handleChurchClick = () => {
    setIsChurchGlowing(!isChurchGlowing);
  };

  const settingsMenu = (
    <Menu>
      <Menu.Item key="theme">
        <Space>
          <span>Темная тема</span>
          <Switch checked={isDarkTheme} onChange={handleThemeChange} />
        </Space>
      </Menu.Item>
    </Menu>
  );

  return (
    <ConfigProvider theme={{
      token: {
        colorPrimary: '#1890ff',
        colorText: isDarkTheme ? '#fff' : '#000',
        colorBgContainer: isDarkTheme ? '#141414' : '#fff',
        colorBgLayout: isDarkTheme ? '#000' : '#f0f2f5',
      },
    }}>
      <Layout className={`layout ${isDarkTheme ? 'dark-theme' : 'light-theme'}`}>
        <div className="header">
          <div className="header-content">
            <div className="header-left">
              <div className="logo-container">
                <div className="logo-circle">
                  <span className="logo-text">Ф</span>
                </div>
                <Title level={4} className="site-title">Интерактивная Физика</Title>
              </div>
              <Menu
                theme="dark"
                mode="horizontal"
                selectedKeys={[getSelectedKey()]}
                className="main-menu"
              >
                <Menu.Item key="1" icon={<HomeOutlined />} title="Главная">
                  <Link to="/" />
                </Menu.Item>
                <Menu.Item key="2" icon={<ExperimentOutlined />} title="Эксперименты">
                  <Link to="/experiments" />
                </Menu.Item>
                <Menu.Item key="3" icon={<BookOutlined />} title="Теория">
                  <Link to="/theory" />
                </Menu.Item>
                <Menu.Item key="4" icon={<ExperimentFilled />} title="Симуляция движения шаров">
                  <Link to="/physics-map" />
                </Menu.Item>
                <Menu.Item key="5" icon={<CarOutlined />} title="Кинематика движения">
                  <Link to="/kinematics" />
                </Menu.Item>
              </Menu>
            </div>
            <div className="header-right">
              <Button 
                type="text" 
                className={`candle-button ${isCandleLit ? 'lit' : ''}`}
                icon={<FireOutlined />}
                onClick={handleCandleClick}
              />
              <Dropdown overlay={settingsMenu} placement="bottomRight">
                <Button type="text" icon={<SettingOutlined />} className="settings-button" />
              </Dropdown>
            </div>
          </div>
        </div>
        <Content className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/experiments" element={<Experiments />} />
            <Route path="/theory" element={<Theory />} />
            <Route path="/physics-map" element={<PhysicsMap />} />
            <Route path="/kinematics" element={<Kinematics />} />
          </Routes>
        </Content>
        <Footer className="footer">
          <div className="footer-content">
            <p>© 2024 Интерактивная Физика. Все права защищены.</p>
            <Button 
              type="primary" 
              className="survey-button"
              href="https://docs.google.com/forms/d/e/1FAIpQLScKR0j_AN7EFu-siJ9wWqq8_08scbDk0m_T87AWRWfPisictQ/viewform?usp=header"
              target="_blank"
            >
              Пройти опрос
            </Button>
          </div>
        </Footer>
      </Layout>

      <Modal
        title="Церковь"
        open={isChurchModalVisible}
        onCancel={handleChurchModalClose}
        footer={null}
        width={800}
        centered
      >
        <div className="church-container">
          <Button 
            type="text" 
            className={`church-button ${isChurchGlowing ? 'glowing' : ''}`}
            icon={<BankOutlined />}
            onClick={handleChurchClick}
          >
            Храм
          </Button>
        </div>
      </Modal>
    </ConfigProvider>
  );
};

export default App; 