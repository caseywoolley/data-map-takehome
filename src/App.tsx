import './App.css';

import { Card, Col, Flex, Layout, Row, Select, Tag } from 'antd';
import { Content, Header } from 'antd/es/layout/layout';
import { FC, useState } from 'react';

import Title from 'antd/es/typography/Title';
import data from './sample_data.json';

type PrivacyDeclaration = {
  data_categories: string[];
  data_subjects: string[];
  data_use: string;
  name: string;
}

type SystemData = {
  description: string;
  fides_key: string;
  name: string;
  privacy_declarations: PrivacyDeclaration[];
  system_dependencies: string[];
  system_type: string;
}

type DataMap = {
  bySystemType: Record<string, string[]>;
  byUse: Record<string, string[]>;
  byCategory: Record<string, string[]>;
}

const groupLabels: Record<keyof DataMap, string> = {
  bySystemType: 'Group By System Type',
  byUse: 'Group By Data Use',
  byCategory: 'Group By Data Category',
}

const systemsMap: Record<string, SystemData> = {}
const dataMap: DataMap = {
  bySystemType: {},
  byUse: {},
  byCategory: {},
}

for (const system of data) {
  systemsMap[system.name] = system;

  if (!dataMap.bySystemType[system.system_type]?.includes(system.name)) {
    dataMap.bySystemType[system.system_type] = [...(dataMap.bySystemType[system.system_type] ?? []), system.name];
  }

  for (const declaration of system.privacy_declarations) {
    dataMap.byUse[declaration.data_use] = [...(dataMap.byUse[declaration.data_use] ?? []), system.name];

    for (const category of declaration.data_categories) {
      dataMap.byCategory[category] = [...(dataMap.byCategory[category] ?? []), system.name];
    }
  }
}

const App: FC = () => {
  const [dataUseSelection, setDataUseSelection] = useState([]);
  const [categorySelection, setCategorySelection] = useState([]);
  const [groupBy, setGroupBy] = useState<keyof DataMap>('bySystemType');

  const dataUseOptions = Object.keys(dataMap.byUse).map(use => ({
    value: use,
  }));

  const dataCategoryOptions = Object.keys(dataMap.byCategory).map(category => ({
    label: category.split('.').at(-1),
    value: category,
  }));

  const groupByOptions = Object.keys(dataMap).map(group => ({
    label: groupLabels[group as keyof DataMap],
    value: group,
  }));

  const shouldShowSystem = (systemName: string) => {
    console.log(dataUseSelection, systemName, dataMap.byUse)
    if (dataUseSelection.length) {
      return dataUseSelection?.some(use => dataMap.byUse[use].includes(systemName))
    } else if (categorySelection.length) {
      return categorySelection?.some(category => dataMap.byCategory[category].includes(systemName))
    }

    return true;
  };

  return (
    <Layout className='app'>
      <Header className='app-header'>
        <Title className='app-title'>Data Map</Title>
      </Header>
      <Layout>
        <Content className='app-content'>
          <Row className='data-filters' gutter={10}>
            <Col span={8}>
              <Select id='data-use-select' onChange={setDataUseSelection} mode='multiple' allowClear placeholder='Filter by Use' options={dataUseOptions}></Select>
            </Col>
            <Col span={8}>
              <Select id='category-select' onChange={setCategorySelection} mode='multiple' allowClear placeholder='Filter by Category' options={dataCategoryOptions}></Select>
            </Col>
            <Col span={8}>
              <Select id='group-by-select' onChange={setGroupBy} defaultValue='bySystemType' placeholder='Group By' options={groupByOptions}></Select>
            </Col>
          </Row>
          <div className='systems-container'>
            {Object.entries(dataMap[groupBy]).map(([groupName, systems]) => (
                <Flex vertical gap='small'>
                  <Title level={3}>{groupBy === 'byCategory' ? groupName.split('.').at(-1) : groupName}</Title>
                  {systems.filter((systemKey) => shouldShowSystem(systemKey)).map((systemKey, i) => {
                    const system = systemsMap[systemKey];
                    return(
                        <Card className='system-card' key={system.name} title={system.name}>
                          <p>{system.description}</p>
                          {Boolean(system.privacy_declarations.length) &&
                            <>
                              <Title level={5}>Privacy</Title>
                              <Flex vertical gap='small'>
                                {
                                  system.privacy_declarations.map(declaration =>
                                    <Card className='privacy-declaration-card' size='small' key={declaration.name} title={declaration.name}>
                                      <Flex vertical gap='small'>
                                        <div>{declaration.data_subjects.map(subject => <Tag color='blue' key={subject}>{subject}</Tag>)}</div>
                                        <div>{declaration.data_categories.map(category => <Tag key={category}>{category.split('.').at(-1)}</Tag>)}</div>
                                      </Flex>
                                    </Card>
                                  )
                                }
                                </Flex>
                            </>
                          }
                        </Card>
                      )
                    }
                  )}
                </Flex>
            ))}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}

export default App;
