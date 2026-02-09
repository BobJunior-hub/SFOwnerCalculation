import { CloseOutlined, SaveOutlined } from '@ant-design/icons';
import { useQueryClient } from '@tanstack/react-query';
import { App, Button, Drawer, Form, Input, InputNumber, Select, Spin } from 'antd';
import React, { useEffect, useState } from 'react';
import { apiRequest, getAuthToken } from './api';
import { useTheme } from './menu';
const { TextArea } = Input;


const DeductionDrawer = ({ open, onClose, onSuccess, calculation, deduction }) => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [loadingDriver, setLoadingDriver] = useState(false);
  const [driverData, setDriverData] = useState(null);
  const [loadingTrucks, setLoadingTrucks] = useState(false);
  const [allTrucks, setAllTrucks] = useState([]);
  const currentTheme = useTheme();
  const queryClient = useQueryClient();

  const fetchAllTrucks = async () => {
    if (!getAuthToken()) {
      return;
    }

    setLoadingTrucks(true);
    try {
      const result = await apiRequest('/calculations/all-trucks');

      let trucksList = [];
      if (Array.isArray(result)) {
        trucksList = result;
      } else if (result && typeof result === 'object') {
        trucksList = result.trucks || result.data || result.results || result.items || [];
        if (!Array.isArray(trucksList) && typeof trucksList === 'object') {
          trucksList = Object.values(trucksList);
        }
      }

      setAllTrucks(Array.isArray(trucksList) ? trucksList : []);
    } catch (err) {
      message.error('Failed to load trucks. Please try again.');
      setAllTrucks([]);
    } finally {
      setLoadingTrucks(false);
    }
  };

  useEffect(() => {
    if (open && calculation) {
      fetchAllTrucks();
      if (deduction) {
        const truckId = typeof deduction.truck === 'object' ? (deduction.truck?.id || deduction.truck?._id) : deduction.truck;
        form.setFieldsValue({
          owner: typeof deduction.owner === 'object' ? (deduction.owner?.id || deduction.owner?._id) : (deduction.owner || calculation.id || null),
          truck: truckId ? String(truckId) : null,
          driver: deduction.driver || '',
          amount: deduction.amount || null,
          escrow: deduction.escrow || null,
          note: deduction.note || '',
        });
      } else {
        form.resetFields();
        setDriverData(null);
        const ownerId = calculation.id || null;
        if (ownerId) {
          form.setFieldsValue({ owner: ownerId });
        }
      }
    }
  }, [open, calculation, deduction, form]);

  const fetchDriverStatement = async (driverId) => {
    if (!driverId || !calculation) {
      return;
    }

    const startDate = calculation.start_date;
    const endDate = calculation.end_date;

    if (!startDate || !endDate) {
      return;
    }

    setLoadingDriver(true);
    try {
      const params = new URLSearchParams({
        driver: driverId,
        start_date: startDate,
        end_date: endDate,
      });

      const result = await apiRequest(`/calculations/statement-by-driver/?${params.toString()}`);

      if (result && Array.isArray(result) && result.length > 0) {
        const fetchedDriverData = result[0];

        let driverName = '';
        if (fetchedDriverData.driver) {
          if (typeof fetchedDriverData.driver === 'object' && fetchedDriverData.driver.name) {
            driverName = fetchedDriverData.driver.name;
          } else if (typeof fetchedDriverData.driver === 'string') {
            driverName = fetchedDriverData.driver;
          }
        } else {
          driverName = fetchedDriverData.driver_name || '';
        }

        const amount = fetchedDriverData.total_amount || fetchedDriverData.amount || 0;
        const escrow = fetchedDriverData.escrow || fetchedDriverData.total_escrow || 0;
        const pdfUrl = fetchedDriverData.pdf_file || fetchedDriverData.pdf_file_url || fetchedDriverData.statement?.pdf_file || fetchedDriverData.statement?.pdf_file_url || null;
        const statementId = fetchedDriverData.id ?? fetchedDriverData.statement?.id ?? fetchedDriverData.statement ?? fetchedDriverData.statement_id ?? null;

        setDriverData({
          driverName: driverName,
          amount: amount,
          escrow: escrow,
          pdfUrl: pdfUrl,
          statementId: statementId,
        });

        form.setFieldsValue({
          driver: driverName,
          amount: amount,
          escrow: escrow,
        });

        message.success('Driver data loaded successfully!');
      } else if (result && typeof result === 'object' && !Array.isArray(result)) {
        let driverName = '';
        if (result.driver) {
          if (typeof result.driver === 'object' && result.driver.name) {
            driverName = result.driver.name;
          } else if (typeof result.driver === 'string') {
            driverName = result.driver;
          }
        } else {
          driverName = result.driver_name || '';
        }

        const amount = result.total_amount || result.amount || 0;
        const escrow = result.escrow || result.total_escrow || 0;
        const pdfUrl = result.pdf_file || result.pdf_file_url || result.statement?.pdf_file || result.statement?.pdf_file_url || null;
        const statementId = result.id ?? result.statement?.id ?? result.statement ?? result.statement_id ?? null;

        setDriverData({
          driverName: driverName,
          amount: amount,
          escrow: escrow,
          pdfUrl: pdfUrl,
          statementId: statementId,
        });

        form.setFieldsValue({
          driver: driverName,
          amount: amount,
          escrow: escrow,
        });

        message.success('Driver data loaded successfully!');
      } else {
        setDriverData(null);
        message.info('No driver statement found. Please fill the fields manually.');
      }
    } catch (error) {
      console.error('Error fetching driver statement:', error);
      setDriverData(null);
      message.warning('Could not fetch driver statement. Please fill the fields manually.');
    } finally {
      setLoadingDriver(false);
    }
  };


  const handleSubmit = async (values) => {
    if (!calculation) {
      message.error('Calculation data is missing');
      return;
    }

    if (!calculation.start_date || !calculation.end_date) {
      message.error('Date range is missing from calculation');
      return;
    }

    const ownerId = calculation.id || null;

    if (!ownerId) {
      message.error('Owner ID is missing from calculation');
      return;
    }

    setLoading(true);
    try {

      let amountValue = 0;
      if (values.amount !== null && values.amount !== undefined && values.amount !== '') {
        if (typeof values.amount === 'string') {
          const cleaned = values.amount.replace(/[^0-9.-]/g, '');
          amountValue = parseFloat(cleaned);
        } else {
          amountValue = parseFloat(values.amount);
        }
        if (isNaN(amountValue)) {
          amountValue = 0;
        }
      }

      let escrowValue = 0;
      if (values.escrow !== null && values.escrow !== undefined && values.escrow !== '') {
        if (typeof values.escrow === 'string') {
          const cleaned = values.escrow.replace(/[^0-9.-]/g, '');
          escrowValue = parseFloat(cleaned);
        } else {
          escrowValue = parseFloat(values.escrow);
        }
        if (isNaN(escrowValue)) {
          escrowValue = 0;
        }
      }

      const payload = {
        owner: Number(ownerId),
        driver: values.driver || '',
        amount: amountValue,
        escrow: escrowValue,
        start_date: calculation.start_date,
        end_date: calculation.end_date,
      };

      if (values.truck) {
        payload.truck = Number(values.truck);
      }

      if (values.note && values.note.trim()) {
        payload.note = values.note.trim();
      }

      const statementId = driverData?.statementId ?? (deduction?.statement?.id ?? deduction?.statement ?? deduction?.statement_id ?? null);
      if (statementId) {
        payload.statement = Number(statementId);
      }

      const calculationUnitPayload = {
        owner: Number(ownerId),
        driver: values.driver || '',
        amount: amountValue,
        escrow: escrowValue,
        start_date: calculation.start_date,
        end_date: calculation.end_date,
      };

      if (values.truck) {
        calculationUnitPayload.truck = Number(values.truck);
      }

      if (values.note && values.note.trim()) {
        calculationUnitPayload.note = values.note.trim();
      }

      if (statementId) {
        calculationUnitPayload.statement = Number(statementId);
      }

      if (deduction && deduction.id) {
        console.log('=== Updating Deduction ===');
        console.log('Deduction ID:', deduction.id);
        console.log('Sending PUT request to /calculations/calculation-unit/' + deduction.id + '/ with payload:', calculationUnitPayload);

        const updatedDeduction = await apiRequest(`/calculations/calculation-unit/${deduction.id}/`, {
          method: 'PUT',
          body: JSON.stringify(calculationUnitPayload),
        });

        console.log('Deduction updated successfully');
        message.success('Deduction updated successfully!');
        queryClient.invalidateQueries({ queryKey: ['owner'] });
        queryClient.invalidateQueries({ queryKey: ['owner-calculation'] });
        form.resetFields();
        setDriverData(null);
        onClose();
        if (onSuccess) {
          onSuccess(updatedDeduction);
        }
      } else {
        console.log('=== Creating Deduction for Specific Week ===');
        console.log('Week Period:', calculation.start_date, 'to', calculation.end_date);
        console.log('Owner ID:', ownerId);
        console.log('Owner Name:', calculation.owner);
        console.log('Sending POST request to /calculations/calculation-unit/ with payload:', calculationUnitPayload);

        const createdDeduction = await apiRequest('/calculations/calculation-unit/', {
          method: 'POST',
          body: JSON.stringify(calculationUnitPayload),
        });

        console.log('Calculation unit created successfully');
        message.success('Deduction created successfully for the selected owner and period!');
        queryClient.invalidateQueries({ queryKey: ['owner'] });
        queryClient.invalidateQueries({ queryKey: ['owner-calculation'] });
        form.resetFields();
        setDriverData(null);
        onClose();
        if (onSuccess) {
          onSuccess(createdDeduction);
        }
      }
    } catch (error) {
      console.error('Error creating deduction:', error);
      message.error(error.message || 'Failed to create deduction');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    form.resetFields();
    setDriverData(null);
    onClose();
  };


  if (!calculation) return null;

  const ownerId = calculation.owner_id || (calculation.owner && typeof calculation.owner === 'number' ? calculation.owner : null);

  const periodInfo = calculation.start_date && calculation.end_date
    ? `${calculation.start_date} to ${calculation.end_date}`
    : 'Period not specified';

  return (
    <Drawer
      title={
        <div>
          <h2 className={`text-xl font-bold ${currentTheme === 'dark' ? 'text-white/85' : 'text-black/85'}`}>
            {deduction ? 'Edit Deduction' : 'Add Deduction'}
          </h2>
          <div className={`text-sm space-y-1 ${currentTheme === 'dark' ? 'text-white/50' : 'text-black/50'}`}>
            <p>Owner: {calculation.owner || 'N/A'} (ID: {ownerId || 'N/A'})</p>
            <p>Period: {periodInfo}</p>
          </div>
        </div>
      }
      placement="right"
      onClose={handleClose}
      open={open}
      width={600}
      duration={0.10}
      className={currentTheme === 'dark' ? 'bg-white/5' : 'bg-white'}
      styles={{
        body: {
          backgroundColor: currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#ffffff',
        },
        header: {
          borderBottom: `1px solid ${currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
        },
      }}
      closeIcon={<CloseOutlined />}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className={currentTheme === 'dark' ? 'text-white/85' : 'text-black/85'}
      >
        <Form.Item
          name="owner"
          label={<span className={currentTheme === 'dark' ? 'text-white/70' : 'text-black/70'}>Owner ID</span>}
          rules={[{ required: true, message: 'Owner ID is required' }]}
          initialValue={ownerId}>
          <InputNumber
            placeholder="Owner ID"
            disabled
            value={ownerId}
            style={{ width: '100%' }}
            readOnly
          />
        </Form.Item>

        <Form.Item
          name="truck"
          label={<span className={currentTheme === 'dark' ? 'text-white/70' : 'text-black/70'}>Truck Unit</span>}
        >
          <Select
            placeholder="Select truck unit (optional)"
            style={{ width: '100%' }}
            allowClear
            loading={loadingTrucks}
            showSearch
            onChange={(value) => {
              if (value) {
                const selectedTruck = allTrucks.find(truck => {
                  const truckId = truck.id || truck._id;
                  return String(truckId) === String(value);
                });

                if (selectedTruck) {
                  let driverNames = [];
                  let driverId = null;

                  if (selectedTruck.driver && Array.isArray(selectedTruck.driver) && selectedTruck.driver.length > 0) {
                    driverNames = selectedTruck.driver
                      .map((d) => d.full_name)
                      .filter((name) => name && name.trim());
                    driverId = selectedTruck.driver[0]?.id ?? selectedTruck.driver[0]?._id ?? null;
                  } else if (selectedTruck.driver && typeof selectedTruck.driver === 'object') {
                    if (selectedTruck.driver.full_name) {
                      driverNames = [selectedTruck.driver.full_name];
                    }
                    driverId = selectedTruck.driver.id ?? selectedTruck.driver._id ?? null;
                  }

                  if (!driverId && selectedTruck.driver_id) {
                    driverId = selectedTruck.driver_id;
                  }

                  const driverName = driverNames.join(' / ');
                  form.setFieldsValue({ driver: driverName || '' });

                  if (driverId && calculation?.start_date && calculation?.end_date) {
                    fetchDriverStatement(driverId);
                  } else {
                    form.setFieldsValue({ amount: undefined, escrow: undefined });
                    setDriverData(null);
                  }
                }
              } else {
                form.setFieldsValue({ driver: '', amount: undefined, escrow: undefined });
                setDriverData(null);
              }
            }}
            filterOption={(input, option) => {
              const searchText = input.toLowerCase();
              const unitNumber = (option?.unitNumber || '').toLowerCase();
              const driverName = (option?.driverName || '').toLowerCase();
              return unitNumber.includes(searchText) || driverName.includes(searchText);
            }}
            options={allTrucks.map(truck => {
              const truckId = truck.id || truck._id;
              const unitNumber = truck.unit_number || 'N/A';
              let driverNames = [];
              if (truck.driver && Array.isArray(truck.driver) && truck.driver.length > 0) {
                driverNames = truck.driver
                  .map((d) => d.full_name)
                  .filter((name) => name && name.trim());
              } else if (truck.driver && typeof truck.driver === 'object' && truck.driver.full_name) {
                driverNames = [truck.driver.full_name];
              }
              const driverName = driverNames.join(' / ');
              return {
                value: String(truckId),
                label: `Unit ${unitNumber}${driverName ? ` - ${driverName}` : ' - No Driver'}`,
                unitNumber: unitNumber,
                driverName: driverName,
              };
            })}
            notFoundContent={
              loadingTrucks ? (
                <div className="text-center py-2">
                  <Spin size="small" /> <span className={currentTheme === 'dark' ? 'text-white/70' : 'text-black/70'}>Loading trucks...</span>
                </div>
              ) : (
                <div className={`text-center py-2 ${currentTheme === 'dark' ? 'text-white/50' : 'text-black/50'}`}>
                  No trucks found
                </div>
              )
            }
          />
        </Form.Item>

        {loadingDriver && (
          <div className="mb-4 text-center">
            <Spin size="small" /> <span className={currentTheme === 'dark' ? 'text-white/70' : 'text-black/70'}>Loading driver data...</span>
          </div>
        )}

        <Form.Item
          name="driver"
          label={<span className={currentTheme === 'dark' ? 'text-white/70' : 'text-black/70'}>Driver</span>}
        >
          <Input
            placeholder="Enter driver name (optional)"
          />
        </Form.Item>

        <Form.Item
          label={<span className={currentTheme === 'dark' ? 'text-white/70' : 'text-black/70'}>Amount</span>}
          shouldUpdate={(prevValues, currentValues) => prevValues.amount !== currentValues.amount}>
          {({ getFieldValue }) => {
            const amountValue = getFieldValue('amount');
            const amt = parseFloat(amountValue) || 0;
            let color = currentTheme === 'dark' ? '#9ca3af' : '#6b7280';
            if (amt < 0) color = currentTheme === 'dark' ? '#f87171' : '#dc2626';
            if (amt > 0) color = currentTheme === 'dark' ? '#4ade80' : '#16a34a';

            return (
              <Form.Item name="amount" noStyle>
                <InputNumber
                  placeholder="Enter amount (can be positive or negative)"
                  step={0.01}
                  controls={true}
                  keyboard={true}
                  formatter={(value) => {
                    if (!value && value !== 0) return '';
                    const numValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]/g, '')) : value;
                    if (isNaN(numValue)) return '';
                    return `$ ${numValue}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                  }}
                  parser={(value) => {
                    if (!value) return '';
                    const cleaned = value.replace(/[^0-9.-]/g, '');
                    const num = parseFloat(cleaned);
                    return isNaN(num) ? '' : cleaned;
                  }}
                  onKeyPress={(e) => {
                    const char = String.fromCharCode(e.which || e.keyCode);
                    if (!/[0-9.-]/.test(char) && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  style={{
                    color: color,
                    width: '100%'
                  }} />
              </Form.Item>
            );
          }}
        </Form.Item>


        <Form.Item
          label={<span className={currentTheme === 'dark' ? 'text-white/70' : 'text-black/70'}>Escrow</span>}
          shouldUpdate={(prevValues, currentValues) => prevValues.escrow !== currentValues.escrow}
        >
          {({ getFieldValue }) => {
            const escrowValue = getFieldValue('escrow');
            const amt = parseFloat(escrowValue) || 0;
            let color = currentTheme === 'dark' ? '#9ca3af' : '#6b7280';
            if (amt < 0) color = currentTheme === 'dark' ? '#f87171' : '#dc2626';
            if (amt > 0) color = currentTheme === 'dark' ? '#4ade80' : '#16a34a';

            return (
              <Form.Item name="escrow" noStyle>
                <InputNumber
                  placeholder="Enter escrow (can be positive or negative)"
                  step={0.01}
                  controls={true}
                  keyboard={true}
                  formatter={(value) => {
                    if (!value && value !== 0) return '';
                    const numValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]/g, '')) : value;
                    if (isNaN(numValue)) return '';
                    return `$ ${numValue}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                  }}
                  parser={(value) => {
                    if (!value) return '';
                    const cleaned = value.replace(/[^0-9.-]/g, '');
                    const num = parseFloat(cleaned);
                    return isNaN(num) ? '' : cleaned;
                  }}
                  onKeyPress={(e) => {
                    const char = String.fromCharCode(e.which || e.keyCode);
                    if (!/[0-9.-]/.test(char) && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  style={{
                    color: color,
                    width: '100%'
                  }}
                />
              </Form.Item>
            );
          }}
        </Form.Item>

        <Form.Item
          name="note"
          label={<span className={currentTheme === 'dark' ? 'text-white/70' : 'text-black/70'}>Note</span>}
        >
          <TextArea
            placeholder="Enter note (optional)"
            rows={4}
            showCount
            maxLength={500}
          />
        </Form.Item>

        <Form.Item>
          <div className="flex gap-2 justify-end">
            <Button onClick={handleClose} className="hover:border-[#F59A6B] hover:text-[#F59A6B]">
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="bg-[#E77843] hover:bg-[#F59A6B] border-[#E77843] hover:border-[#F59A6B]"
              icon={<SaveOutlined />}>
              {deduction ? 'Update Deduction' : 'Save Deduction'}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default DeductionDrawer;

