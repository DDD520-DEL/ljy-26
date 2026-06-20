const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3002;
const DATA_FILE = path.join(__dirname, 'data.json');

const DEFAULT_DATA = {
  employees: [
    { id: '1', name: '张伟', avatar: '👨‍💼', totalLikes: 0, department: 'rd' },
    { id: '2', name: '李娜', avatar: '👩‍💼', totalLikes: 0, department: 'rd' },
    { id: '3', name: '王强', avatar: '👨‍🔧', totalLikes: 0, department: 'rd' },
    { id: '4', name: '刘芳', avatar: '👩‍🎨', totalLikes: 0, department: 'marketing' },
    { id: '5', name: '陈明', avatar: '👨‍💻', totalLikes: 0, department: 'marketing' },
    { id: '6', name: '赵丽', avatar: '👩‍🔬', totalLikes: 0, department: 'marketing' },
    { id: '7', name: '孙磊', avatar: '👨‍🎨', totalLikes: 0, department: 'admin' },
    { id: '8', name: '周雪', avatar: '👩‍🏫', totalLikes: 0, department: 'admin' },
  ],
  records: [],
  likedRecordIds: [],
  comments: [],
  currentCommenterId: '1',
  _lastModified: Date.now(),
};

function readData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      const data = JSON.parse(content);
      return { ...DEFAULT_DATA, ...data };
    }
  } catch (err) {
    console.error('读取数据文件失败:', err);
  }
  return JSON.parse(JSON.stringify(DEFAULT_DATA));
}

function writeData(data) {
  try {
    const dataToWrite = { ...data, _lastModified: Date.now() };
    fs.writeFileSync(DATA_FILE, JSON.stringify(dataToWrite, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('写入数据文件失败:', err);
    return false;
  }
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

app.get('/api/data', (req, res) => {
  const data = readData();
  res.json({
    employees: data.employees,
    records: data.records,
    likedRecordIds: data.likedRecordIds || [],
    comments: data.comments || [],
    currentCommenterId: data.currentCommenterId || null,
    lastModified: data._lastModified,
  });
});

app.get('/api/employees', (req, res) => {
  const data = readData();
  res.json(data.employees);
});

app.post('/api/employees', (req, res) => {
  const { name, avatar, department } = req.body || {};

  if (!name || !name.trim() || !avatar || !department) {
    return res.status(400).json({ error: '缺少必要字段: name, avatar, department' });
  }

  const data = readData();
  const newEmployee = {
    id: generateId(),
    name: name.trim(),
    avatar,
    totalLikes: 0,
    department,
  };

  data.employees.push(newEmployee);

  if (writeData(data)) {
    res.status(201).json(newEmployee);
  } else {
    res.status(500).json({ error: '保存数据失败' });
  }
});

app.put('/api/employees/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body || {};

  const data = readData();
  const empIndex = data.employees.findIndex(e => e.id === id);

  if (empIndex === -1) {
    return res.status(404).json({ error: '员工不存在' });
  }

  data.employees[empIndex] = { ...data.employees[empIndex], ...updates, id };

  if (writeData(data)) {
    res.json(data.employees[empIndex]);
  } else {
    res.status(500).json({ error: '保存数据失败' });
  }
});

app.get('/api/records', (req, res) => {
  const data = readData();
  res.json(data.records);
});

app.post('/api/records', (req, res) => {
  const { employeeId, bucketType, timestamp } = req.body || {};

  if (!employeeId || !bucketType) {
    return res.status(400).json({ error: '缺少必要字段: employeeId, bucketType' });
  }

  const data = readData();

  const empExists = data.employees.some(e => e.id === employeeId);
  if (!empExists) {
    return res.status(400).json({ error: '员工不存在' });
  }

  const newRecord = {
    id: generateId(),
    employeeId,
    bucketType,
    timestamp: timestamp || new Date().toISOString(),
    likes: 0,
  };

  data.records.unshift(newRecord);

  if (writeData(data)) {
    res.status(201).json(newRecord);
  } else {
    res.status(500).json({ error: '保存数据失败' });
  }
});

app.post('/api/records/batch', (req, res) => {
  const { records } = req.body || {};

  if (!Array.isArray(records) || records.length === 0) {
    return res.status(400).json({ error: 'records 必须是非空数组' });
  }

  const data = readData();
  const createdRecords = [];
  const errors = [];

  records.forEach((rec, idx) => {
    const { employeeId, bucketType, timestamp } = rec || {};
    if (!employeeId || !bucketType) {
      errors.push(`第 ${idx + 1} 条记录缺少必要字段`);
      return;
    }
    const empExists = data.employees.some(e => e.id === employeeId);
    if (!empExists) {
      errors.push(`第 ${idx + 1} 条记录员工不存在`);
      return;
    }
    const newRecord = {
      id: rec.id || generateId(),
      employeeId,
      bucketType,
      timestamp: timestamp || new Date().toISOString(),
      likes: rec.likes || 0,
    };
    data.records.unshift(newRecord);
    createdRecords.push(newRecord);
  });

  if (writeData(data)) {
    res.status(201).json({ created: createdRecords, errors });
  } else {
    res.status(500).json({ error: '保存数据失败', created: createdRecords, errors });
  }
});

app.post('/api/records/:id/like', (req, res) => {
  const { id } = req.params;

  const data = readData();
  const record = data.records.find(r => r.id === id);

  if (!record) {
    return res.status(404).json({ error: '记录不存在' });
  }

  const alreadyLiked = (data.likedRecordIds || []).includes(id);

  if (!alreadyLiked) {
    record.likes += 1;
    const emp = data.employees.find(e => e.id === record.employeeId);
    if (emp) {
      emp.totalLikes = (emp.totalLikes || 0) + 1;
    }
    data.likedRecordIds = [...(data.likedRecordIds || []), id];
  }

  if (writeData(data)) {
    res.json({ record, liked: alreadyLiked });
  } else {
    res.status(500).json({ error: '保存数据失败' });
  }
});

app.get('/api/comments', (req, res) => {
  const data = readData();
  res.json(data.comments || []);
});

app.post('/api/comments', (req, res) => {
  const { recordId, employeeId, content } = req.body || {};

  if (!recordId || !employeeId || !content || !content.trim()) {
    return res.status(400).json({ error: '缺少必要字段: recordId, employeeId, content' });
  }

  const data = readData();

  const recordExists = data.records.some(r => r.id === recordId);
  if (!recordExists) {
    return res.status(400).json({ error: '记录不存在' });
  }

  const empExists = data.employees.some(e => e.id === employeeId);
  if (!empExists) {
    return res.status(400).json({ error: '员工不存在' });
  }

  const newComment = {
    id: generateId(),
    recordId,
    employeeId,
    content: content.trim(),
    timestamp: new Date().toISOString(),
  };

  data.comments = [...(data.comments || []), newComment];

  if (writeData(data)) {
    res.status(201).json(newComment);
  } else {
    res.status(500).json({ error: '保存数据失败' });
  }
});

app.post('/api/sync', (req, res) => {
  const {
    employees = [],
    records = [],
    comments = [],
    likedRecordIds = [],
    currentCommenterId = null,
    clientLastModified = 0,
  } = req.body || {};

  const serverData = readData();
  const conflicts = [];

  if (clientLastModified < (serverData._lastModified || 0)) {
    conflicts.push('服务器数据比客户端新，将采用服务器版本');
  }

  const existingEmpIds = new Set(serverData.employees.map(e => e.id));
  employees.forEach(emp => {
    if (!existingEmpIds.has(emp.id)) {
      serverData.employees.push({ ...emp });
    }
  });

  const existingRecordIds = new Set(serverData.records.map(r => r.id));
  records.forEach(rec => {
    if (!existingRecordIds.has(rec.id)) {
      serverData.records.unshift({ ...rec });
    }
  });

  const existingCommentIds = new Set((serverData.comments || []).map(c => c.id));
  comments.forEach(c => {
    if (!existingCommentIds.has(c.id)) {
      serverData.comments = [...(serverData.comments || []), { ...c }];
    }
  });

  const existingLikes = new Set(serverData.likedRecordIds || []);
  likedRecordIds.forEach(rid => {
    if (!existingLikes.has(rid)) {
      serverData.likedRecordIds = [...(serverData.likedRecordIds || []), rid];
      const rec = serverData.records.find(r => r.id === rid);
      if (rec) {
        rec.likes += 1;
        const emp = serverData.employees.find(e => e.id === rec.employeeId);
        if (emp) {
          emp.totalLikes = (emp.totalLikes || 0) + 1;
        }
      }
    }
  });

  if (currentCommenterId) {
    serverData.currentCommenterId = currentCommenterId;
  }

  serverData.records.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  if (writeData(serverData)) {
    res.json({
      success: true,
      conflicts,
      mergedEmployees: serverData.employees,
      mergedRecords: serverData.records,
      mergedComments: serverData.comments || [],
      mergedLikedRecordIds: serverData.likedRecordIds || [],
      currentCommenterId: serverData.currentCommenterId,
      lastModified: serverData._lastModified,
    });
  } else {
    res.status(500).json({ error: '保存数据失败' });
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 换水英雄榜后端服务已启动`);
  console.log(`📍 服务地址: http://localhost:${PORT}`);
  console.log(`📊 API 健康检查: http://localhost:${PORT}/api/health`);
  console.log(`📁 数据文件: ${DATA_FILE}\n`);

  if (!fs.existsSync(DATA_FILE)) {
    console.log('📝 初始化数据文件...');
    writeData(JSON.parse(JSON.stringify(DEFAULT_DATA)));
  }
});
