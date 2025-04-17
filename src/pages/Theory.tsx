import React, { useEffect, useRef } from 'react';
import { Typography, Card, Collapse, Space, Row, Col, Button } from 'antd';
import { CaretRightOutlined, ArrowRightOutlined } from '@ant-design/icons';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;

const MechanicsVisualization: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);

    // Создаем солнечную систему
    const sunGeometry = new THREE.SphereGeometry(1, 32, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sun);

    const earthOrbit = new THREE.Object3D();
    scene.add(earthOrbit);

    const earthGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const earthMaterial = new THREE.MeshBasicMaterial({ color: 0x2233ff });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    earth.position.x = 3;
    earthOrbit.add(earth);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const animate = () => {
      requestAnimationFrame(animate);
      sun.rotation.y += 0.01;
      earthOrbit.rotation.y += 0.01;
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '300px', background: '#000' }} />
  );
};

const Theory: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="theory-container">
      <div className="theory-header">
        <h1>Теория</h1>
        <p>Изучайте теоретические основы физики с интерактивными примерами</p>
      </div>
      <div className="theory-content">
        <Title level={2}>Теория Физики</Title>
        
        <Collapse
          bordered={false}
          defaultActiveKey={['1']}
          expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
          className="site-collapse-custom-collapse"
        >
          <Panel header="Механика" key="1">
            <Row gutter={[24, 24]}>
              <Col span={12}>
                <Card>
                  <Title level={4}>Основные законы механики</Title>
                  <Paragraph>
                    Механика изучает движение тел и взаимодействие между ними. Основные законы механики были сформулированы Исааком Ньютоном:
                  </Paragraph>
                  <ul>
                    <li>Первый закон Ньютона (закон инерции)</li>
                    <li>Второй закон Ньютона (F = ma)</li>
                    <li>Третий закон Ньютона (действие и противодействие)</li>
                  </ul>
                  <Paragraph>
                    <Text strong>Первый закон Ньютона:</Text> Тело сохраняет состояние покоя или равномерного прямолинейного движения, пока на него не действуют другие тела.
                  </Paragraph>
                  <Paragraph>
                    <Text strong>Второй закон Ньютона:</Text> Ускорение тела прямо пропорционально приложенной силе и обратно пропорционально массе тела.
                  </Paragraph>
                  <Paragraph>
                    <Text strong>Третий закон Ньютона:</Text> Силы, с которыми тела действуют друг на друга, равны по модулю и противоположны по направлению.
                  </Paragraph>
                </Card>
              </Col>
              <Col span={12}>
                <Card title="Визуализация движения планет">
                  <MechanicsVisualization />
                  <Paragraph style={{ marginTop: '1rem' }}>
                    На этой визуализации показано движение Земли вокруг Солнца, демонстрирующее законы Кеплера и гравитационное взаимодействие.
                  </Paragraph>
                </Card>
              </Col>
            </Row>
          </Panel>

          <Panel header="Термодинамика" key="2">
            <Row gutter={[24, 24]}>
              <Col span={12}>
                <Card>
                  <Title level={4}>Законы термодинамики</Title>
                  <Paragraph>
                    Термодинамика изучает тепловые явления и процессы преобразования энергии:
                  </Paragraph>
                  <ul>
                    <li>Первый закон термодинамики (закон сохранения энергии)</li>
                    <li>Второй закон термодинамики (рост энтропии)</li>
                    <li>Третий закон термодинамики (абсолютный ноль)</li>
                  </ul>
                  <Paragraph>
                    <Text strong>Первый закон термодинамики:</Text> Изменение внутренней энергии системы равно сумме теплоты, переданной системе, и работы, совершенной над системой.
                  </Paragraph>
                  <Paragraph>
                    <Text strong>Второй закон термодинамики:</Text> В изолированной системе энтропия не может уменьшаться.
                  </Paragraph>
                  <Paragraph>
                    <Text strong>Третий закон термодинамики:</Text> При стремлении температуры к абсолютному нулю энтропия стремится к постоянной величине.
                  </Paragraph>
                </Card>
              </Col>
              <Col span={12}>
                <Card title="Тепловые процессы">
                  <Paragraph>
                    В термодинамике рассматриваются различные тепловые процессы:
                  </Paragraph>
                  <ul>
                    <li>Изотермический процесс (T = const)</li>
                    <li>Изобарный процесс (P = const)</li>
                    <li>Изохорный процесс (V = const)</li>
                    <li>Адиабатный процесс (Q = 0)</li>
                  </ul>
                  <Paragraph>
                    Каждый процесс описывается своим уравнением состояния и имеет характерные особенности.
                  </Paragraph>
                </Card>
              </Col>
            </Row>
          </Panel>

          <Panel header="Электродинамика" key="3">
            <Row gutter={[24, 24]}>
              <Col span={12}>
                <Card>
                  <Title level={4}>Электричество и магнетизм</Title>
                  <Paragraph>
                    Электродинамика изучает электрические и магнитные явления:
                  </Paragraph>
                  <ul>
                    <li>Закон Кулона</li>
                    <li>Закон Ома</li>
                    <li>Закон Фарадея</li>
                    <li>Уравнения Максвелла</li>
                  </ul>
                  <Paragraph>
                    <Text strong>Закон Кулона:</Text> Сила взаимодействия двух точечных зарядов прямо пропорциональна произведению их величин и обратно пропорциональна квадрату расстояния между ними.
                  </Paragraph>
                  <Paragraph>
                    <Text strong>Закон Ома:</Text> Сила тока в проводнике прямо пропорциональна напряжению и обратно пропорциональна сопротивлению.
                  </Paragraph>
                  <Paragraph>
                    <Text strong>Закон Фарадея:</Text> ЭДС индукции в контуре равна скорости изменения магнитного потока через поверхность, ограниченную контуром.
                  </Paragraph>
                </Card>
              </Col>
              <Col span={12}>
                <Card title="Электромагнитные волны">
                  <Paragraph>
                    Электромагнитные волны - это распространяющееся в пространстве электромагнитное поле. Они характеризуются:
                  </Paragraph>
                  <ul>
                    <li>Длиной волны</li>
                    <li>Частотой</li>
                    <li>Скоростью распространения</li>
                    <li>Поляризацией</li>
                  </ul>
                  <Paragraph>
                    Электромагнитные волны включают в себя:
                  </Paragraph>
                  <ul>
                    <li>Радиоволны</li>
                    <li>Микроволны</li>
                    <li>Инфракрасное излучение</li>
                    <li>Видимый свет</li>
                    <li>Ультрафиолетовое излучение</li>
                    <li>Рентгеновское излучение</li>
                    <li>Гамма-излучение</li>
                  </ul>
                </Card>
              </Col>
            </Row>
          </Panel>
        </Collapse>
      </div>
      <div className="navigation-buttons">
        <Button 
          type="primary" 
          icon={<ArrowRightOutlined />}
          onClick={() => navigate('/physics-map')}
        >
          К визуализации
        </Button>
      </div>
    </div>
  );
};

export default Theory; 