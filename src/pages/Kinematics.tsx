import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { Button, Slider, Card, Space, Typography, Row, Col, Statistic, Modal, Checkbox } from 'antd';
import { useNavigate } from 'react-router-dom';
import './Kinematics.css';

const { Text, Title } = Typography;

const Kinematics: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const carRef = useRef<THREE.Group | null>(null);
  const roadRef = useRef<THREE.Group | null>(null);
  const navigate = useNavigate();
  const animationFrameRef = useRef<number>();
  const carPositionRef = useRef<number>(0);
  const roadPositionRef = useRef<number>(0);
  const distanceRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  const velocityRef = useRef<number>(0);
  const accelerationRef = useRef<number>(0);
  const [graphScale, setGraphScale] = useState(1);
  const [graphWidth, setGraphWidth] = useState(200);
  const [graphOffset, setGraphOffset] = useState(0);
  const [showPath, setShowPath] = useState(true);
  const [showVelocity, setShowVelocity] = useState(true);
  const [showAcceleration, setShowAcceleration] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [showValues, setShowValues] = useState(true);
  const [selectedPoint, setSelectedPoint] = useState<{x: number, y: number, v: number, a: number} | null>(null);

  // Настройки симуляции
  const [speed, setSpeed] = useState(5); // м/с
  const [distance, setDistance] = useState(0); // м
  const [time, setTime] = useState(0); // с
  const [velocity, setVelocity] = useState(0); // м/с
  const [acceleration, setAcceleration] = useState(0); // м/с²
  const [graphData, setGraphData] = useState<{x: number, y: number, v: number, a: number}[]>([]);
  const [isGraphModalVisible, setIsGraphModalVisible] = useState(false);

  const createCar = useCallback(() => {
    if (!sceneRef.current) return;

    const car = new THREE.Group();

    // Кузов машины
    const bodyGeometry = new THREE.BoxGeometry(3, 1.5, 1.5);
    const bodyMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xff0000,
      shininess: 100,
      specular: 0x111111
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.75;
    body.castShadow = true;
    car.add(body);

    // Кабина
    const cabinGeometry = new THREE.BoxGeometry(1.8, 1.2, 1.6);
    const cabinMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x333333,
      shininess: 100,
      specular: 0x111111
    });
    const cabin = new THREE.Mesh(cabinGeometry, cabinMaterial);
    cabin.position.set(0.4, 1.7, 0);
    cabin.castShadow = true;
    car.add(cabin);

    // Лобовое стекло
    const windshieldGeometry = new THREE.BoxGeometry(1.5, 1, 0.1);
    const windshieldMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x88ccff,
      transparent: true,
      opacity: 0.7,
      shininess: 100
    });
    const windshield = new THREE.Mesh(windshieldGeometry, windshieldMaterial);
    windshield.position.set(0.4, 1.7, 0);
    car.add(windshield);

    // Заднее стекло
    const rearWindowGeometry = new THREE.BoxGeometry(1.2, 0.8, 0.1);
    const rearWindowMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x88ccff,
      transparent: true,
      opacity: 0.7,
      shininess: 100
    });
    const rearWindow = new THREE.Mesh(rearWindowGeometry, rearWindowMaterial);
    rearWindow.position.set(-0.8, 1.4, 0);
    car.add(rearWindow);

    // Колеса
    const wheelGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.4, 32);
    const wheelMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x000000,
      shininess: 50,
      specular: 0x111111
    });
    
    const wheelPositions = [
      [-1.2, 0.4, 0.75],
      [1.2, 0.4, 0.75],
      [-1.2, 0.4, -0.75],
      [1.2, 0.4, -0.75]
    ];

    wheelPositions.forEach(pos => {
      const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(pos[0], pos[1], pos[2]);
      wheel.castShadow = true;
      car.add(wheel);
    });

    // Фары
    const headlightGeometry = new THREE.SphereGeometry(0.25, 32, 32);
    const headlightMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xffffcc,
      emissive: 0xffffcc,
      emissiveIntensity: 0.5
    });
    
    const headlight1 = new THREE.Mesh(headlightGeometry, headlightMaterial);
    headlight1.position.set(1.5, 0.75, 0.5);
    car.add(headlight1);

    const headlight2 = new THREE.Mesh(headlightGeometry, headlightMaterial);
    headlight2.position.set(1.5, 0.75, -0.5);
    car.add(headlight2);

    // Задние фонари
    const taillightGeometry = new THREE.SphereGeometry(0.2, 32, 32);
    const taillightMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xff0000,
      emissive: 0xff0000,
      emissiveIntensity: 0.5
    });
    
    const taillight1 = new THREE.Mesh(taillightGeometry, taillightMaterial);
    taillight1.position.set(-1.5, 0.75, 0.5);
    car.add(taillight1);

    const taillight2 = new THREE.Mesh(taillightGeometry, taillightMaterial);
    taillight2.position.set(-1.5, 0.75, -0.5);
    car.add(taillight2);

    // Бампер передний
    const frontBumperGeometry = new THREE.BoxGeometry(3.2, 0.3, 1.6);
    const frontBumperMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x333333,
      shininess: 50
    });
    const frontBumper = new THREE.Mesh(frontBumperGeometry, frontBumperMaterial);
    frontBumper.position.set(1.6, 0.3, 0);
    car.add(frontBumper);

    // Бампер задний
    const rearBumperGeometry = new THREE.BoxGeometry(3.2, 0.3, 1.6);
    const rearBumperMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x333333,
      shininess: 50
    });
    const rearBumper = new THREE.Mesh(rearBumperGeometry, rearBumperMaterial);
    rearBumper.position.set(-1.6, 0.3, 0);
    car.add(rearBumper);

    sceneRef.current.add(car);
    carRef.current = car;
  }, []);

  const createRoad = useCallback(() => {
    if (!sceneRef.current) return;

    const road = new THREE.Group();

    // Дорога
    const roadGeometry = new THREE.PlaneGeometry(200, 4);
    const roadMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x333333,
      shininess: 30
    });
    const roadMesh = new THREE.Mesh(roadGeometry, roadMaterial);
    roadMesh.position.y = -1;
    roadMesh.receiveShadow = true;
    road.add(roadMesh);

    // Разметка
    const lineGeometry = new THREE.PlaneGeometry(2, 0.2);
    const lineMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 0.2
    });
    
    for (let i = -100; i < 100; i += 4) {
      const line = new THREE.Mesh(lineGeometry, lineMaterial);
      line.position.set(i, -1, 0.1);
      line.receiveShadow = true;
      road.add(line);
    }

    // Обочина
    const shoulderGeometry = new THREE.PlaneGeometry(200, 0.5);
    const shoulderMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x666666,
      shininess: 30
    });
    
    const shoulder1 = new THREE.Mesh(shoulderGeometry, shoulderMaterial);
    shoulder1.position.set(0, -1, 2.25);
    road.add(shoulder1);

    const shoulder2 = new THREE.Mesh(shoulderGeometry, shoulderMaterial);
    shoulder2.position.set(0, -1, -2.25);
    road.add(shoulder2);

    sceneRef.current.add(road);
    roadRef.current = road;
  }, []);

  const resetSimulation = useCallback(() => {
    if (!sceneRef.current) return;

    if (carRef.current) {
      sceneRef.current.remove(carRef.current);
    }
    if (roadRef.current) {
      sceneRef.current.remove(roadRef.current);
    }

    createCar();
    createRoad();
    carPositionRef.current = 0;
    roadPositionRef.current = 0;
    distanceRef.current = 0;
    timeRef.current = 0;
    velocityRef.current = 0;
    accelerationRef.current = 0;
    setDistance(0);
    setTime(0);
    setVelocity(0);
    setAcceleration(0);
    setGraphData([]);
  }, [createCar, createRoad]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Создание сцены
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);
    sceneRef.current = scene;

    // Освещение
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Создание камеры
    const aspect = width / height;
    const camera = new THREE.OrthographicCamera(
      -10 * aspect,
      10 * aspect,
      10,
      -10,
      0.1,
      1000
    );
    camera.position.set(0, 5, 10);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Создание рендерера
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Инициализация
    resetSimulation();

    let lastTime = performance.now();
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      const currentTime = performance.now();
      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      // Обновление позиций
      if (carRef.current && roadRef.current) {
        // Расчет ускорения
        const targetVelocity = speed;
        const currentVelocity = velocityRef.current;
        const acceleration = (targetVelocity - currentVelocity) * 2; // Коэффициент плавности
        velocityRef.current += acceleration * deltaTime;
        accelerationRef.current = acceleration;

        const deltaPosition = velocityRef.current * deltaTime;
        
        // Обновление позиции машины
        carPositionRef.current += deltaPosition;
        carRef.current.position.x = carPositionRef.current;
        
        // Обновление позиции дороги
        roadPositionRef.current -= deltaPosition;
        roadRef.current.position.x = roadPositionRef.current % 200;

        // Обновление времени и расстояния
        timeRef.current += deltaTime;
        distanceRef.current += deltaPosition;

        // Обновление состояний
        setTime(Math.round(timeRef.current * 10) / 10);
        setDistance(Math.round(distanceRef.current));
        setVelocity(Math.round(velocityRef.current * 10) / 10);
        setAcceleration(Math.round(accelerationRef.current * 100) / 100);

        // Обновление графика
        setGraphData(prev => [...prev, { 
          x: timeRef.current, 
          y: distanceRef.current,
          v: velocityRef.current,
          a: accelerationRef.current
        }]);

        // Обновление позиции камеры
        if (cameraRef.current) {
          const cameraOffset = 5;
          cameraRef.current.position.x = carPositionRef.current + cameraOffset;
          cameraRef.current.lookAt(carPositionRef.current, 0, 0);
        }

        // Вращение колес
        carRef.current.children.forEach((child, index) => {
          if (index >= 2 && index <= 5) { // Колеса
            child.rotation.x -= deltaPosition * 2;
          }
        });
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container || !cameraRef.current || !rendererRef.current) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      const aspect = width / height;
      
      cameraRef.current.left = -10 * aspect;
      cameraRef.current.right = 10 * aspect;
      cameraRef.current.top = 10;
      cameraRef.current.bottom = -10;
      cameraRef.current.updateProjectionMatrix();
      
      rendererRef.current.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (container && rendererRef.current) {
        container.removeChild(rendererRef.current.domElement);
      }
      if (sceneRef.current) {
        sceneRef.current.clear();
      }
    };
  }, [resetSimulation, speed]);

  useEffect(() => {
    if (graphData.length > 0) {
      const lastPoint = graphData[graphData.length - 1];
      if (lastPoint.x > graphWidth - 20) {
        setGraphWidth(prev => prev + 20);
        setGraphOffset(prev => prev + 20);
      }
    }
  }, [graphData, graphWidth]);

  const handleGraphClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = (e.clientX - rect.left + graphOffset) / graphScale;
    const y = (rect.bottom - e.clientY) / graphScale;
    
    // Находим ближайшую точку данных
    const closestPoint = graphData.reduce((closest, point) => {
      const distance = Math.sqrt(
        Math.pow(point.x * 20 - x, 2) + 
        Math.pow(point.y / 10 - y, 2)
      );
      return distance < closest.distance ? { point, distance } : closest;
    }, { point: graphData[0], distance: Infinity });
    
    setSelectedPoint(closestPoint.point);
  };

  return (
    <div className="kinematics-container">
      <div className="kinematics-header">
        <h1>Кинематика движения</h1>
        <p>Наблюдайте за движением автомобиля и относительным движением фона</p>
        <Button type="primary" onClick={() => navigate('/experiments')}>
          К экспериментам
        </Button>
      </div>
      <Row className="simulation-content">
        <Col span={18} className="visualization-container">
          <div ref={containerRef} className="three-container" />
        </Col>
        <Col span={6} className="settings-container">
          <Card className="settings-panel">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text>Скорость автомобиля: {speed.toFixed(1)} м/с</Text>
                <Slider
                  min={0}
                  max={20}
                  step={0.1}
                  value={speed}
                  onChange={setSpeed}
                />
              </div>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Statistic
                    title="Пройденное расстояние"
                    value={distance}
                    suffix="м"
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Время движения"
                    value={time}
                    suffix="с"
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Текущая скорость"
                    value={velocity}
                    suffix="м/с"
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Ускорение"
                    value={acceleration}
                    suffix="м/с²"
                  />
                </Col>
              </Row>
              <Button onClick={resetSimulation}>
                Сбросить симуляцию
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
      <div className="formulas-section">
        <Row gutter={[16, 16]}>
          <Col span={8}>
            <Card>
              <Title level={4}>Равномерное прямолинейное движение</Title>
              <Text>
                S = v * t
                <br />
                Где:
                <br />
                S = {distance} м (пройденный путь)
                <br />
                v = {velocity} м/с (скорость)
                <br />
                t = {time} с (время)
              </Text>
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Title level={4}>Ускорение</Title>
              <Text>
                a = Δv / Δt
                <br />
                Где:
                <br />
                a = {acceleration} м/с² (ускорение)
                <br />
                Δv = {velocity - speed} м/с (изменение скорости)
                <br />
                Δt = {time} с (время)
              </Text>
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Title level={4}>Графики движения</Title>
              <Button 
                type="primary" 
                onClick={() => setIsGraphModalVisible(true)}
                style={{ marginBottom: 16 }}
              >
                Показать графики
              </Button>
            </Card>
          </Col>
        </Row>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Card>
              <Title level={4}>Объяснение работы симуляции</Title>
              <div className="explanation-section">
                <div className="explanation-content">
                  <p>
                    <strong>Красный график</strong> показывает зависимость пройденного пути от времени. 
                    Чем круче линия, тем быстрее движется автомобиль.
                  </p>
                  <p>
                    <strong>Синий график</strong> отображает скорость автомобиля. При увеличении скорости 
                    с помощью слайдера, график поднимается вверх.
                  </p>
                  <p>
                    <strong>Зеленый график</strong> показывает ускорение автомобиля. Когда вы изменяете 
                    скорость, ускорение сначала увеличивается, затем уменьшается до нуля.
                  </p>
                </div>
              </div>
            </Card>
          </Col>
          <Col span={12}>
            <Card>
              <Title level={4}>Интересные факты</Title>
              <div className="facts-section">
                <div className="facts-content">
                  <ul>
                    <li>
                      <strong>Формула пути S = v * t</strong> была впервые сформулирована Галилео Галилеем в XVII веке.
                    </li>
                    <li>
                      <strong>Формула ускорения a = Δv / Δt</strong> является основой второго закона Ньютона.
                    </li>
                    <li>
                      <strong>Графики движения</strong> были впервые использованы Рене Декартом в XVII веке.
                    </li>
                    <li>
                      <strong>Скорость света</strong> (300 000 км/с) является максимально возможной скоростью во Вселенной.
                    </li>
                  </ul>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      <Modal
        title="Графики движения"
        open={isGraphModalVisible}
        onCancel={() => {
          setIsGraphModalVisible(false);
          setSelectedPoint(null);
        }}
        footer={null}
        width={800}
      >
        <div style={{ marginBottom: 16 }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Space>
              <Button onClick={() => setGraphScale(prev => Math.min(prev + 0.2, 2))}>+</Button>
              <Button onClick={() => setGraphScale(prev => Math.max(prev - 0.2, 0.5))}>-</Button>
              <span>Масштаб: {graphScale.toFixed(1)}x</span>
            </Space>
            <Space>
              <Checkbox checked={showPath} onChange={e => setShowPath(e.target.checked)}>
                Путь
              </Checkbox>
              <Checkbox checked={showVelocity} onChange={e => setShowVelocity(e.target.checked)}>
                Скорость
              </Checkbox>
              <Checkbox checked={showAcceleration} onChange={e => setShowAcceleration(e.target.checked)}>
                Ускорение
              </Checkbox>
              <Checkbox checked={showGrid} onChange={e => setShowGrid(e.target.checked)}>
                Сетка
              </Checkbox>
              <Checkbox checked={showValues} onChange={e => setShowValues(e.target.checked)}>
                Значения
              </Checkbox>
            </Space>
          </Space>
        </div>
        <div className="graph-container" style={{ height: '400px', overflowX: 'auto' }}>
          <svg 
            width={`${graphWidth}%`} 
            height="100%" 
            style={{ transform: `translateX(-${graphOffset}px)` }}
            onClick={handleGraphClick}
          >
            {/* Оси графика */}
            <line x1="0" y1="100%" x2="100%" y2="100%" stroke="black" strokeWidth="1" />
            <line x1="0" y1="0" x2="0" y2="100%" stroke="black" strokeWidth="1" />
            
            {/* Сетка */}
            {showGrid && (
              <>
                {Array.from({ length: Math.ceil(graphWidth / 20) }).map((_, i) => (
                  <React.Fragment key={`grid-x-${i}`}>
                    <line 
                      x1={i * 20 * graphScale} 
                      y1="0" 
                      x2={i * 20 * graphScale} 
                      y2="100%" 
                      stroke="rgba(0,0,0,0.1)" 
                      strokeWidth="1" 
                    />
                  </React.Fragment>
                ))}
                
                {Array.from({ length: 6 }).map((_, i) => (
                  <React.Fragment key={`grid-y-${i}`}>
                    <line 
                      x1="0" 
                      y1={i * 20 * graphScale} 
                      x2="100%" 
                      y2={i * 20 * graphScale} 
                      stroke="rgba(0,0,0,0.1)" 
                      strokeWidth="1" 
                    />
                  </React.Fragment>
                ))}
              </>
            )}
            
            {/* Разметка осей */}
            {Array.from({ length: Math.ceil(graphWidth / 20) }).map((_, i) => (
              <React.Fragment key={`x-${i}`}>
                <line 
                  x1={i * 20 * graphScale} 
                  y1="95%" 
                  x2={i * 20 * graphScale} 
                  y2="100%" 
                  stroke="black" 
                  strokeWidth="1" 
                />
                <text x={i * 20 * graphScale} y="100%" textAnchor="middle" fontSize="12" dy="20">
                  {i}
                </text>
              </React.Fragment>
            ))}
            
            {Array.from({ length: 6 }).map((_, i) => (
              <React.Fragment key={`y-${i}`}>
                <line 
                  x1="-5" 
                  y1={i * 20 * graphScale} 
                  x2="5" 
                  y2={i * 20 * graphScale} 
                  stroke="black" 
                  strokeWidth="1" 
                />
                <text x="-10" y={i * 20 * graphScale + 5} textAnchor="end" fontSize="12">
                  {i * 5}
                </text>
              </React.Fragment>
            ))}
            
            {/* График пути */}
            {showPath && (
              <>
                <path
                  d={graphData.map((point, i) => {
                    const x = Math.min(Math.max(point.x * 20 * graphScale, 0), graphWidth);
                    const y = Math.min(Math.max(100 - point.y / 10 * graphScale, 0), 100);
                    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                  }).join(' ')}
                  stroke="red"
                  strokeWidth="2"
                  fill="none"
                />
                {graphData.map((point, i) => (
                  <circle
                    key={`path-point-${i}`}
                    cx={point.x * 20 * graphScale}
                    cy={100 - point.y / 10 * graphScale}
                    r="2"
                    fill="red"
                    style={{ cursor: 'pointer' }}
                  />
                ))}
              </>
            )}
            
            {/* График скорости */}
            {showVelocity && (
              <>
                <path
                  d={graphData.map((point, i) => {
                    const x = Math.min(Math.max(point.x * 20 * graphScale, 0), graphWidth);
                    const y = Math.min(Math.max(100 - point.v * 20 * graphScale, 0), 100);
                    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                  }).join(' ')}
                  stroke="blue"
                  strokeWidth="2"
                  fill="none"
                />
                {graphData.map((point, i) => (
                  <circle
                    key={`velocity-point-${i}`}
                    cx={point.x * 20 * graphScale}
                    cy={100 - point.v * 20 * graphScale}
                    r="2"
                    fill="blue"
                    style={{ cursor: 'pointer' }}
                  />
                ))}
              </>
            )}
            
            {/* График ускорения */}
            {showAcceleration && (
              <>
                <path
                  d={graphData.map((point, i) => {
                    const x = Math.min(Math.max(point.x * 20 * graphScale, 0), graphWidth);
                    const y = Math.min(Math.max(100 - point.a * 50 * graphScale, 0), 100);
                    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                  }).join(' ')}
                  stroke="green"
                  strokeWidth="2"
                  fill="none"
                />
                {graphData.map((point, i) => (
                  <circle
                    key={`acceleration-point-${i}`}
                    cx={point.x * 20 * graphScale}
                    cy={100 - point.a * 50 * graphScale}
                    r="2"
                    fill="green"
                    style={{ cursor: 'pointer' }}
                  />
                ))}
              </>
            )}

            {/* Выбранная точка */}
            {selectedPoint && (
              <>
                <circle
                  cx={selectedPoint.x * 20 * graphScale}
                  cy={100 - selectedPoint.y / 10 * graphScale}
                  r="4"
                  fill="black"
                  stroke="white"
                  strokeWidth="1"
                />
                <text
                  x={selectedPoint.x * 20 * graphScale + 10}
                  y={100 - selectedPoint.y / 10 * graphScale - 10}
                  fontSize="12"
                  fill="black"
                >
                  t: {selectedPoint.x.toFixed(1)}с
                  <tspan x={selectedPoint.x * 20 * graphScale + 10} dy="15">
                    S: {selectedPoint.y.toFixed(1)}м
                  </tspan>
                  <tspan x={selectedPoint.x * 20 * graphScale + 10} dy="15">
                    v: {selectedPoint.v.toFixed(1)}м/с
                  </tspan>
                  <tspan x={selectedPoint.x * 20 * graphScale + 10} dy="15">
                    a: {selectedPoint.a.toFixed(1)}м/с²
                  </tspan>
                </text>
              </>
            )}

            {/* Текущие значения */}
            {showValues && graphData.length > 0 && (
              <>
                <text
                  x="90%"
                  y="20%"
                  textAnchor="end"
                  fontSize="12"
                  fill="red"
                  style={{ display: showPath ? 'block' : 'none' }}
                >
                  Путь: {graphData[graphData.length - 1].y.toFixed(1)} м
                </text>
                <text
                  x="90%"
                  y="30%"
                  textAnchor="end"
                  fontSize="12"
                  fill="blue"
                  style={{ display: showVelocity ? 'block' : 'none' }}
                >
                  Скорость: {graphData[graphData.length - 1].v.toFixed(1)} м/с
                </text>
                <text
                  x="90%"
                  y="40%"
                  textAnchor="end"
                  fontSize="12"
                  fill="green"
                  style={{ display: showAcceleration ? 'block' : 'none' }}
                >
                  Ускорение: {graphData[graphData.length - 1].a.toFixed(1)} м/с²
                </text>
              </>
            )}
          </svg>
          <div className="graph-legend">
            <span style={{ color: 'red', display: showPath ? 'inline' : 'none' }}>Путь (м)</span>
            <span style={{ color: 'blue', display: showVelocity ? 'inline' : 'none' }}>Скорость (м/с)</span>
            <span style={{ color: 'green', display: showAcceleration ? 'inline' : 'none' }}>Ускорение (м/с²)</span>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Kinematics; 