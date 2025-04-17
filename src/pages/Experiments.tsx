import React, { useEffect, useRef, useState } from 'react';
import { Typography, Card, Slider, Space, Tabs, Button } from 'antd';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { useNavigate } from 'react-router-dom';
import { ArrowRightOutlined } from '@ant-design/icons';
import './Experiments.css';

interface ExperimentProps {
  isDarkMode: boolean;
}

const { Title } = Typography;
const { TabPane } = Tabs;

const MechanicsExperiment: React.FC<ExperimentProps> = ({ isDarkMode }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const ballRef = useRef<THREE.Mesh>();
  const animationRef = useRef<number>();
  const [velocity, setVelocity] = useState(5);
  const [mass, setMass] = useState(1);
  const [isLaunched, setIsLaunched] = useState(false);
  const [position, setPosition] = useState(0);
  const [time, setTime] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(isDarkMode ? '#1a1a1a' : '#f0f0f0');
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Ball setup
    const geometry = new THREE.SphereGeometry(0.5, 32, 32);
    const material = new THREE.MeshPhongMaterial({ 
      color: '#1890ff',
      shininess: 100,
      specular: new THREE.Color('#ffffff')
    });
    const ball = new THREE.Mesh(geometry, material);
    ball.position.y = 0;
    scene.add(ball);
    ballRef.current = ball;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Ground plane
    const groundGeometry = new THREE.PlaneGeometry(10, 1);
    const groundMaterial = new THREE.MeshPhongMaterial({ 
      color: isDarkMode ? '#303030' : '#cccccc',
      side: THREE.DoubleSide
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = Math.PI / 2;
    ground.position.y = -1;
    scene.add(ground);

    // Animation
    const animate = () => {
      if (isLaunched) {
        const acceleration = -9.8; // gravity
        const newTime = time + 0.016; // assuming 60fps
        const newPosition = velocity * newTime + 0.5 * acceleration * newTime * newTime;
        
        if (newPosition >= -0.5) { // Check if ball is above ground
          ball.position.y = newPosition;
          setPosition(newPosition);
          setTime(newTime);
        } else {
          setIsLaunched(false);
          setTime(0);
          setPosition(0);
          ball.position.y = 0;
        }
      }

      renderer.render(scene, camera);
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      containerRef.current?.removeChild(renderer.domElement);
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
    };
  }, [isDarkMode, isLaunched, velocity, time]);

  const handleLaunch = () => {
    setIsLaunched(true);
    setTime(0);
    setPosition(0);
  };

  return (
    <div className="experiment-container">
      <div ref={containerRef} className="visualization-container" />
      <div className="controls">
        <div className="control-group">
          <label>Начальная скорость (м/с):</label>
          <Slider
            min={1}
            max={10}
            value={velocity}
            onChange={(value) => setVelocity(value)}
            disabled={isLaunched}
          />
        </div>
        <div className="control-group">
          <label>Масса шара (кг):</label>
          <Slider
            min={0.1}
            max={5}
            step={0.1}
            value={mass}
            onChange={(value) => setMass(value)}
            disabled={isLaunched}
          />
        </div>
        <Button 
          type="primary" 
          onClick={handleLaunch}
          disabled={isLaunched}
        >
          Запустить
        </Button>
        <div className="info-panel">
          <p>Высота: {position.toFixed(2)} м</p>
          <p>Время: {time.toFixed(2)} с</p>
          <p>Скорость: {(velocity - 9.8 * time).toFixed(2)} м/с</p>
        </div>
      </div>
      <div className="explanation-section">
        <h3>Как работает симуляция механики</h3>
        <p>
          В этой симуляции демонстрируются основные законы механики:
        </p>
        <ul>
          <li>Движение тела под действием силы тяжести</li>
          <li>Зависимость траектории от начальной скорости</li>
          <li>Влияние массы тела на его движение</li>
        </ul>
        <p>
          При запуске симуляции шар движется по параболической траектории, 
          что соответствует движению тела, брошенного под углом к горизонту. 
          Вы можете изменять начальную скорость и массу шара, наблюдая за 
          изменением его траектории.
        </p>
      </div>
    </div>
  );
};

const ThermodynamicsExperiment: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [temperature, setTemperature] = useState(273); // 0°C

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const particles: THREE.Mesh[] = [];
    const particleCount = 100;

    for (let i = 0; i < particleCount; i++) {
      const geometry = new THREE.SphereGeometry(0.1, 8, 8);
      const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
      const particle = new THREE.Mesh(geometry, material);
      
      particle.position.set(
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 4
      );
      
      scene.add(particle);
      particles.push(particle);
    }

    const animate = () => {
      requestAnimationFrame(animate);
      
      particles.forEach(particle => {
        const speed = temperature / 273; // Нормализованная скорость
        particle.position.x += (Math.random() - 0.5) * 0.1 * speed;
        particle.position.y += (Math.random() - 0.5) * 0.1 * speed;
        particle.position.z += (Math.random() - 0.5) * 0.1 * speed;
        
        // Ограничение движения частиц
        if (Math.abs(particle.position.x) > 2) particle.position.x *= -0.9;
        if (Math.abs(particle.position.y) > 2) particle.position.y *= -0.9;
        if (Math.abs(particle.position.z) > 2) particle.position.z *= -0.9;
      });
      
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      particles.forEach(particle => {
        particle.geometry.dispose();
        if (particle.material instanceof THREE.Material) {
          particle.material.dispose();
        }
      });
    };
  }, [temperature]);

  return (
    <div className="experiment-container">
      <div ref={containerRef} className="visualization-container" />
      <div className="controls">
        <div className="control-group">
          <label>Температура (К):</label>
          <Slider 
            value={temperature} 
            onChange={setTemperature} 
            min={0} 
            max={1000} 
            step={1} 
          />
        </div>
      </div>
      <div className="explanation-section">
        <h3>Как работает симуляция термодинамики</h3>
        <p>
          В этой симуляции демонстрируются основные принципы термодинамики:
        </p>
        <ul>
          <li>Движение молекул газа</li>
          <li>Зависимость скорости движения от температуры</li>
          <li>Столкновения молекул и их взаимодействие</li>
        </ul>
        <p>
          При изменении температуры вы можете наблюдать, как меняется 
          скорость движения частиц. Чем выше температура, тем быстрее 
          движутся молекулы, что соответствует увеличению их кинетической 
          энергии.
        </p>
      </div>
    </div>
  );
};

const ElectrodynamicsExperiment: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [voltage, setVoltage] = useState(1);
  const [resistance, setResistance] = useState(1);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // Создаем электрическую цепь
    const wireGeometry = new THREE.CylinderGeometry(0.05, 0.05, 4, 8);
    const wireMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    const wire = new THREE.Mesh(wireGeometry, wireMaterial);
    scene.add(wire);

    const current = voltage / resistance;
    const electronCount = Math.min(Math.abs(current) * 10, 50);

    const electrons: THREE.Mesh[] = [];
    for (let i = 0; i < electronCount; i++) {
      const electronGeometry = new THREE.SphereGeometry(0.1, 8, 8);
      const electronMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
      const electron = new THREE.Mesh(electronGeometry, electronMaterial);
      
      electron.position.set(
        (Math.random() - 0.5) * 4,
        0,
        0
      );
      
      scene.add(electron);
      electrons.push(electron);
    }

    const animate = () => {
      requestAnimationFrame(animate);
      
      electrons.forEach(electron => {
        electron.position.x += current * 0.01;
        if (electron.position.x > 2) electron.position.x = -2;
        if (electron.position.x < -2) electron.position.x = 2;
      });
      
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      wire.geometry.dispose();
      if (wire.material instanceof THREE.Material) {
        wire.material.dispose();
      }
      electrons.forEach(electron => {
        electron.geometry.dispose();
        if (electron.material instanceof THREE.Material) {
          electron.material.dispose();
        }
      });
    };
  }, [voltage, resistance]);

  return (
    <div className="experiment-container">
      <div ref={containerRef} className="visualization-container" />
      <div className="controls">
        <div className="control-group">
          <label>Напряжение (В):</label>
          <Slider 
            value={voltage} 
            onChange={setVoltage} 
            min={0} 
            max={10} 
            step={0.1} 
          />
        </div>
        <div className="control-group">
          <label>Сопротивление (Ом):</label>
          <Slider 
            value={resistance} 
            onChange={setResistance} 
            min={0.1} 
            max={10} 
            step={0.1} 
          />
        </div>
      </div>
      <div className="explanation-section">
        <h3>Как работает симуляция электродинамики</h3>
        <p>
          В этой симуляции демонстрируются основные законы электродинамики:
        </p>
        <ul>
          <li>Закон Ома</li>
          <li>Зависимость силы тока от напряжения и сопротивления</li>
          <li>Движение заряженных частиц в электрическом поле</li>
        </ul>
        <p>
          При изменении напряжения и сопротивления вы можете наблюдать, 
          как меняется сила тока в цепи. Это наглядно демонстрирует 
          зависимость I = U/R, где I - сила тока, U - напряжение, 
          R - сопротивление.
        </p>
      </div>
    </div>
  );
};

const Experiments: React.FC = () => {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <div className="experiments-container">
      <div className="experiments-header">
        <h1>Эксперименты</h1>
        <p>Проводите виртуальные эксперименты и наблюдайте за физическими явлениями</p>
      </div>
      <div className="experiments-content">
        <Title level={2}>Интерактивные Эксперименты</Title>
        
        <Tabs defaultActiveKey="1" size="large">
          <TabPane tab="Механика" key="1">
            <MechanicsExperiment isDarkMode={isDarkMode} />
          </TabPane>
          <TabPane tab="Термодинамика" key="2">
            <ThermodynamicsExperiment />
          </TabPane>
          <TabPane tab="Электродинамика" key="3">
            <ElectrodynamicsExperiment />
          </TabPane>
        </Tabs>
      </div>
      <div className="navigation-buttons">
        <Button 
          type="primary" 
          size="large"
          icon={<ArrowRightOutlined />}
          onClick={() => navigate('/theory')}
        >
          К теории
        </Button>
      </div>
    </div>
  );
};

export default Experiments; 