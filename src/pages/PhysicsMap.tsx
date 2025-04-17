import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { Button, Slider, Card, Space, Typography, Row, Col, Statistic } from 'antd';
import { useNavigate } from 'react-router-dom';
import './PhysicsMap.css';

const { Text } = Typography;
const { Countdown } = Statistic;

interface Ball {
  mesh: THREE.Mesh;
  velocity: THREE.Vector2;
  position: THREE.Vector2;
  radius: number;
  color: string;
  mass: number;
}

const PhysicsMap: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [balls, setBalls] = useState<Ball[]>([]);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const navigate = useNavigate();
  const [simulationTime, setSimulationTime] = useState(0);
  const animationFrameRef = useRef<number>();
  const boundaryRef = useRef<THREE.LineSegments | null>(null);

  // Настройки симуляции в СИ
  const [ballCount, setBallCount] = useState(6);
  const [ballSpeed, setBallSpeed] = useState(5); // м/с
  const [gravity, setGravity] = useState(9.81); // м/с²
  const [atmosphere, setAtmosphere] = useState(0.99);
  const [energyLoss, setEnergyLoss] = useState(0.8);
  const [simulationArea, setSimulationArea] = useState(10); // м

  const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];

  const createBoundary = useCallback(() => {
    if (!sceneRef.current || boundaryRef.current) return;

    const halfArea = simulationArea / 2;
    const geometry = new THREE.BufferGeometry();
    const vertices = new Float32Array([
      -halfArea, -halfArea, 0,
      halfArea, -halfArea, 0,
      halfArea, halfArea, 0,
      -halfArea, halfArea, 0,
      -halfArea, -halfArea, 0
    ]);
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    
    const material = new THREE.LineBasicMaterial({ 
      color: 0x00ff00,
      transparent: true,
      opacity: 0.5
    });
    
    const boundary = new THREE.LineSegments(geometry, material);
    sceneRef.current.add(boundary);
    boundaryRef.current = boundary;
  }, [simulationArea]);

  const updateBoundary = useCallback(() => {
    if (!boundaryRef.current) return;

    const halfArea = simulationArea / 2;
    const vertices = new Float32Array([
      -halfArea, -halfArea, 0,
      halfArea, -halfArea, 0,
      halfArea, halfArea, 0,
      -halfArea, halfArea, 0,
      -halfArea, -halfArea, 0
    ]);
    
    boundaryRef.current.geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(vertices, 3)
    );
    boundaryRef.current.geometry.attributes.position.needsUpdate = true;
  }, [simulationArea]);

  const createBall = useCallback((position: THREE.Vector2, color: string): Ball => {
    const radius = 0.3; // м
    const geometry = new THREE.CircleGeometry(radius, 32);
    const material = new THREE.MeshBasicMaterial({ 
      color: color,
      transparent: true,
      opacity: 0.8
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(position.x, position.y, 0);
    sceneRef.current?.add(mesh);

    return {
      mesh,
      velocity: new THREE.Vector2(
        (Math.random() - 0.5) * ballSpeed,
        (Math.random() - 0.5) * ballSpeed
      ),
      position: position.clone(),
      radius,
      color,
      mass: 1 // кг
    };
  }, [ballSpeed]);

  const resetSimulation = useCallback(() => {
    if (!sceneRef.current) return;

    // Удаляем старые шары
    balls.forEach(ball => {
      sceneRef.current?.remove(ball.mesh);
    });

    // Создаем новые шары
    const newBalls: Ball[] = [];
    const positions = [
      new THREE.Vector2(-2, 0),
      new THREE.Vector2(2, 0),
      new THREE.Vector2(0, 2),
      new THREE.Vector2(0, -2),
      new THREE.Vector2(-2, 2),
      new THREE.Vector2(2, -2)
    ];

    for (let i = 0; i < ballCount; i++) {
      const pos = positions[i % positions.length].clone();
      pos.x += (Math.random() - 0.5) * 2;
      pos.y += (Math.random() - 0.5) * 2;
      newBalls.push(createBall(pos, colors[i % colors.length]));
    }

    setBalls(newBalls);
    setSimulationTime(0);
  }, [ballCount, createBall, colors]);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Создание сцены
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    sceneRef.current = scene;

    // Создание камеры (орфографическая для 2D)
    const aspect = width / height;
    const camera = new THREE.OrthographicCamera(
      -simulationArea * aspect,
      simulationArea * aspect,
      simulationArea,
      -simulationArea,
      0.1,
      1000
    );
    camera.position.z = 5;
    cameraRef.current = camera;

    // Создание рендерера
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Создание границ
    createBoundary();

    // Инициализация шаров
    resetSimulation();

    let lastTime = performance.now();
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      const currentTime = performance.now();
      const deltaTime = (currentTime - lastTime) / 1000; // в секундах
      lastTime = currentTime;

      // Обновление времени симуляции
      setSimulationTime(prev => prev + deltaTime);

      // Обновление границ
      updateBoundary();

      // Обновление позиций шаров
      setBalls(prevBalls => {
        const newBalls = prevBalls.map(ball => {
          // Применяем гравитацию
          ball.velocity.y -= gravity * deltaTime;
          
          // Применяем атмосферное сопротивление
          ball.velocity.multiplyScalar(Math.pow(atmosphere, deltaTime));
          
          // Обновляем позицию
          ball.position.add(ball.velocity.clone().multiplyScalar(deltaTime));
          ball.mesh.position.set(ball.position.x, ball.position.y, 0);

          // Отражение от стен с потерей энергии
          const halfArea = simulationArea / 2;
          if (Math.abs(ball.position.x) > halfArea - ball.radius) {
            ball.position.x = Math.sign(ball.position.x) * (halfArea - ball.radius);
            ball.velocity.x *= -energyLoss;
          }
          if (Math.abs(ball.position.y) > halfArea - ball.radius) {
            ball.position.y = Math.sign(ball.position.y) * (halfArea - ball.radius);
            ball.velocity.y *= -energyLoss;
          }

          return { ...ball };
        });

        // Проверка столкновений
        for (let i = 0; i < newBalls.length; i++) {
          for (let j = i + 1; j < newBalls.length; j++) {
            const ball1 = newBalls[i];
            const ball2 = newBalls[j];
            const distance = ball1.position.distanceTo(ball2.position);
            
            if (distance < ball1.radius + ball2.radius) {
              // Расчет нормали столкновения
              const normal = new THREE.Vector2()
                .subVectors(ball1.position, ball2.position)
                .normalize();
              
              // Расчет относительной скорости
              const relativeVelocity = new THREE.Vector2()
                .subVectors(ball1.velocity, ball2.velocity);
              
              // Расчет импульса
              const impulse = 2 * relativeVelocity.dot(normal) / 
                (ball1.mass + ball2.mass);
              
              // Обновление скоростей
              ball1.velocity.sub(normal.clone().multiplyScalar(impulse * ball2.mass));
              ball2.velocity.add(normal.clone().multiplyScalar(impulse * ball1.mass));
            }
          }
        }

        return newBalls;
      });

      renderer.render(scene, camera);
    };
    animate();

    // Обработка ресайза
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      const aspect = width / height;
      
      camera.left = -simulationArea * aspect;
      camera.right = simulationArea * aspect;
      camera.top = simulationArea;
      camera.bottom = -simulationArea;
      camera.updateProjectionMatrix();
      
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // Очистка
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (boundaryRef.current) {
        scene.remove(boundaryRef.current);
      }
      container.removeChild(renderer.domElement);
      scene.clear();
    };
  }, [ballCount, ballSpeed, gravity, atmosphere, energyLoss, simulationArea, resetSimulation, createBoundary, updateBoundary]);

  return (
    <div className="physics-map-container">
      <div className="physics-map-header">
        <h1>Симуляция движения шаров</h1>
        <p>Наблюдайте за движением шаров и их взаимодействием</p>
        <Button type="primary" onClick={() => navigate('/experiments')}>
          К экспериментам
        </Button>
      </div>
      <Row className="simulation-content">
        <Col span={18} className="visualization-container">
          <div ref={containerRef} className="three-container" />
          <div className="timer">
            <Countdown
              value={Date.now() + simulationTime * 1000}
              format="HH:mm:ss"
            />
          </div>
        </Col>
        <Col span={6} className="settings-container">
          <Card className="settings-panel">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text>Количество шаров: {ballCount}</Text>
                <Slider
                  min={1}
                  max={20}
                  value={ballCount}
                  onChange={setBallCount}
                />
              </div>
              <div>
                <Text>Скорость шаров: {ballSpeed.toFixed(1)} м/с</Text>
                <Slider
                  min={0.1}
                  max={100}
                  step={0.1}
                  value={ballSpeed}
                  onChange={setBallSpeed}
                />
              </div>
              <div>
                <Text>Гравитация: {gravity.toFixed(1)} м/с²</Text>
                <Slider
                  min={0}
                  max={20}
                  step={0.1}
                  value={gravity}
                  onChange={setGravity}
                />
              </div>
              <div>
                <Text>Сопротивление воздуха: {(1 - atmosphere).toFixed(3)}</Text>
                <Slider
                  min={0.9}
                  max={1}
                  step={0.001}
                  value={atmosphere}
                  onChange={setAtmosphere}
                />
              </div>
              <div>
                <Text>Потеря энергии при отскоке: {(1 - energyLoss).toFixed(2)}</Text>
                <Slider
                  min={0.5}
                  max={1}
                  step={0.01}
                  value={energyLoss}
                  onChange={setEnergyLoss}
                />
              </div>
              <div>
                <Text>Размер области: {simulationArea} м</Text>
                <Slider
                  min={5}
                  max={20}
                  step={1}
                  value={simulationArea}
                  onChange={setSimulationArea}
                />
              </div>
              <Button onClick={resetSimulation}>
                Сбросить симуляцию
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
      
      <div className="simulation-explanation">
        <h2>Объяснение симуляции движения шаров</h2>
        
        <div className="explanation-section">
          <h3>Основные законы физики</h3>
          <p>
            Симуляция основана на законах классической механики:
          </p>
          <ul>
            <li>
              <strong>Первый закон Ньютона (Закон инерции):</strong>
              <br />
              Тело сохраняет состояние покоя или равномерного прямолинейного движения, пока на него не действует внешняя сила.
            </li>
            <li>
              <strong>Второй закон Ньютона:</strong>
              <br />
              F = m * a
              <br />
              Где:
              <br />
              F - сила (Н)
              <br />
              m - масса (кг)
              <br />
              a - ускорение (м/с²)
            </li>
            <li>
              <strong>Закон сохранения импульса:</strong>
              <br />
              m₁v₁ + m₂v₂ = m₁v₁' + m₂v₂'
              <br />
              Где:
              <br />
              m - масса шаров
              <br />
              v - скорость до столкновения
              <br />
              v' - скорость после столкновения
            </li>
          </ul>
        </div>

        <div className="explanation-section">
          <h3>Формулы столкновений</h3>
          <p>
            При столкновении шаров используются следующие формулы:
          </p>
          <ul>
            <li>
              <strong>Скорость после столкновения:</strong>
              <br />
              v₁' = (m₁ - m₂)v₁ + 2m₂v₂ / (m₁ + m₂)
              <br />
              v₂' = (m₂ - m₁)v₂ + 2m₁v₁ / (m₁ + m₂)
            </li>
            <li>
              <strong>Кинетическая энергия:</strong>
              <br />
              E = ½mv²
              <br />
              Где:
              <br />
              E - кинетическая энергия (Дж)
              <br />
              m - масса (кг)
              <br />
              v - скорость (м/с)
            </li>
          </ul>
        </div>

        <div className="explanation-section">
          <h3>Интересные факты</h3>
          <ul>
            <li>
              При абсолютно упругом столкновении (как в нашей симуляции) сохраняется как импульс, так и кинетическая энергия.
            </li>
            <li>
              Если массы шаров равны, они просто обмениваются скоростями при столкновении.
            </li>
            <li>
              Чем больше масса шара, тем меньше он изменяет свою скорость при столкновении.
            </li>
            <li>
              В реальном мире все столкновения частично неупругие, и часть энергии превращается в тепло.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PhysicsMap; 