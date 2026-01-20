import { CloseOutlined, DeleteOutlined, LoadingOutlined, PlusOutlined, SaveOutlined, TruckOutlined } from '@ant-design/icons';
import { useQueryClient } from '@tanstack/react-query';
import { App, Button, DatePicker, Drawer, Input, InputNumber, Select } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect } from 'react';
import { useOwner } from '../../hooks/useOwner';
import { useTheme } from '../../menu';
import { owners } from './helpers/owners';

const { TextArea } = Input;

export const OwerForm = ({ open, onClose, onSuccess }) => {
  const { message } = App.useApp();
  const currentTheme = useTheme();
  const queryClient = useQueryClient();
  const {
    Options,
    addTruck,
    removeTruck,
    updateTruckData,
    setStart_date,
    setEnd_date,
    startDateForPicker,
    endDateForPicker,
    trucksData,
    loadingDrivers,
    selectedOwner,
    setSelectedOwner,
    isSubmitting,
    handleSubmit,
    resetForm,
    selectedUnitValue,
    setSelectedUnitValue,
    start_date,
    end_date,
  } = useOwner();

  const handleFormSubmit = async () => {
    await handleSubmit(
      (successMsg) => {
        message.success(successMsg);
        resetForm();
        queryClient.invalidateQueries({ queryKey: ['owner'] });
        if (onSuccess) onSuccess();
        onClose();
      },
      (errorMsg) => {
        message.error(errorMsg);
      }
    );
  };

  const handleClose = () => {
    resetForm();
    queryClient.invalidateQueries({ queryKey: ['owner'] });
    onClose();
  };

  useEffect(() => {
    if (!open) {
      resetForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Drawer
      title={
        <div className="flex items-start justify-between w-full pr-8">
          <div>
            <h2 className={`text-xl font-bold ${currentTheme === 'dark' ? 'text-white/85' : 'text-black/85'}`}>
              Create New Owner Calculation
            </h2>
            <p className={`text-sm ${currentTheme === 'dark' ? 'text-white/50' : 'text-black/50'}`}>
              Calculate statements for specific trucks
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg border ${currentTheme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-black/10 shadow-sm'}`}>
              <div className="flex flex-col items-end">
                <span className={`text-xs font-medium ${currentTheme === 'dark' ? 'text-white/50' : 'text-black/50'}`}>
                  Total Amount of All Units
                </span>
                <span
                  className={`text-lg font-bold mt-1 ${
                    (() => {
                      const totalSum = trucksData.reduce((sum, item) => {
                        const amt = parseFloat(item.totalAmount) || 0;
                        return sum + amt;
                      }, 0);
                      if (totalSum < 0) return currentTheme === 'dark' ? 'text-red-400' : 'text-red-600';
                      if (totalSum > 0) return currentTheme === 'dark' ? 'text-green-400' : 'text-green-600';
                      return currentTheme === 'dark' ? 'text-white/70' : 'text-black/70';
                    })()
                  }`}
                >
                  {(() => {
                    const totalSum = trucksData.reduce((sum, item) => {
                      const amt = parseFloat(item.totalAmount) || 0;
                      return sum + amt;
                    }, 0);
                    const sign = totalSum < 0 ? '-' : '';
                    return `${sign}$${Math.abs(totalSum).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
                  })()}
                </span>
              </div>
            </div>
            <div className={`p-3 rounded-lg border ${currentTheme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-black/10 shadow-sm'}`}>
              <div className="flex flex-col items-end">
                <span className={`text-xs font-medium ${currentTheme === 'dark' ? 'text-white/50' : 'text-black/50'}`}>
                  Total Escrow of All Units
                </span>
                <span
                  className={`text-lg font-bold mt-1 ${
                    (() => {
                      const totalEscrow = trucksData.reduce((sum, item) => {
                        const amt = parseFloat(item.escrow) || 0;
                        return sum + amt;
                      }, 0);
                      if (totalEscrow < 0) return currentTheme === 'dark' ? 'text-red-400' : 'text-red-600';
                      if (totalEscrow > 0) return currentTheme === 'dark' ? 'text-blue-400' : 'text-blue-600';
                      return currentTheme === 'dark' ? 'text-white/70' : 'text-black/70';
                    })()
                  }`}
                >
                  {(() => {
                    const totalEscrow = trucksData.reduce((sum, item) => {
                      const amt = parseFloat(item.escrow) || 0;
                      return sum + amt;
                    }, 0);
                    const sign = totalEscrow < 0 ? '-' : '';
                    return `${sign}$${Math.abs(totalEscrow).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
                  })()}
                </span>
              </div>
            </div>
          </div>
        </div>
      }
      placement="right"
      onClose={handleClose}
      open={open}
      width={900}
      className={currentTheme === 'dark' ? 'bg-white/5' : 'bg-white'}
      styles={{
        body: {
          backgroundColor: currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#ffffff',
          padding: 0,
        },
        header: {
          borderBottom: `1px solid ${currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
        },
      }}
      closeIcon={<CloseOutlined />}
    >
      <div className={`flex flex-col h-full ${currentTheme === 'dark' ? 'text-white/85' : 'text-black/85'}`}>
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${currentTheme === 'dark' ? 'bg-white/10 text-white/70' : 'bg-orange-100 text-orange-600'
                }`}>
                1
              </span>
              <span className={currentTheme === 'dark' ? 'text-white/70' : 'text-orange-600'}>Configuration</span>
            </div>

            <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 p-5 rounded-xl border ${currentTheme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-black/10 shadow-sm'
              }`}>
              <div className="md:col-span-2">
                <label className={`block text-sm font-semibold mb-1.5 ${currentTheme === 'dark' ? 'text-white/70' : 'text-black/70'}`}>
                  Fleet Owner
                </label>
                <Select
                  className="w-full"
                  placeholder="Choose owner..."
                  value={selectedOwner}
                  onChange={(value) => {
                    setSelectedOwner(value);
                  }}
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={owners}
                />
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-1.5 ${currentTheme === 'dark' ? 'text-white/70' : 'text-black/70'}`}>
                  Period Start
                </label>
                <DatePicker
                  className="w-full"
                  format="YYYY-MM-DD"
                  value={startDateForPicker}
                  onChange={(date) => {
                    if (date) {
                      const startDateStr = dayjs(date).format('YYYY-MM-DD');
                      setStart_date(startDateStr);
                      const endDate = dayjs(date).add(6, 'day');
                      setEnd_date(endDate.format('YYYY-MM-DD'));
                    } else {
                      setStart_date(null);
                      setEnd_date(null);
                    }
                  }}
                />
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-1.5 ${currentTheme === 'dark' ? 'text-white/70' : 'text-black/70'}`}>
                  Period End
                </label>
                <DatePicker
                  className="w-full"
                  format="YYYY-MM-DD"
                  onChange={(date) => setEnd_date(date ? dayjs(date).format('YYYY-MM-DD') : null)}
                  value={endDateForPicker}
                />
              </div>
            </div>
          </section>

          {trucksData.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${currentTheme === 'dark' ? 'bg-white/10 text-white/70' : 'bg-orange-100 text-orange-600'
                    }`}>
                    2
                  </span>
                  <span className={currentTheme === 'dark' ? 'text-white/70' : 'text-orange-600'}>Calculation Units</span>
                </div>
                <div className={`text-xs font-medium ${currentTheme === 'dark' ? 'text-white/50' : 'text-black/50'}`}>
                  {trucksData.length} Unit(s) selected
                </div>
              </div>

              <div className="space-y-4">
                {trucksData.map((data) => (
                  <div
                    key={data.truckId}
                    className={`border rounded-lg p-4 transition-all ${currentTheme === 'dark'
                      ? 'border-white/10 bg-white/5'
                      : 'border-black/10 bg-white shadow-sm'
                      }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentTheme === 'dark' ? 'bg-white/10 text-white/70' : 'bg-gray-100 text-gray-600'
                          }`}>
                          <TruckOutlined style={{ fontSize: '16px' }} />
                        </div>
                        <div>
                          <span className={`font-bold text-sm block ${currentTheme === 'dark' ? 'text-white/85' : 'text-black/85'}`}>
                            Unit {data.unitNumber}
                          </span>
                          <span className={`text-xs block ${currentTheme === 'dark' ? 'text-white/50' : 'text-black/50'}`}>
                            VIN: {data.vin}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {(data.status === 'loading' || loadingDrivers[data.truckId]) && (
                          <LoadingOutlined style={{ fontSize: '16px', color: '#E77843' }} spin />
                        )}
                        {data.status === 'fetched' && (
                          <span className={`text-xs px-2 py-1 rounded-full ${currentTheme === 'dark' ? 'bg-green-500/10 text-green-500' : 'bg-green-100 text-green-600'}`}>
                            Fetched
                          </span>
                        )}
                        <button
                          onClick={() => removeTruck(data.truckId)}
                          className={`transition-colors ${currentTheme === 'dark' ? 'text-white/30 hover:text-red-500' : 'text-gray-300 hover:text-red-500'
                            }`}
                        >
                          <DeleteOutlined style={{ fontSize: '16px' }} />
                        </button>
                      </div>
                    </div>

                    {data.status !== 'loading' && !loadingDrivers[data.truckId] && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className={`text-xs font-medium mb-1 block ${currentTheme === 'dark' ? 'text-white/50' : 'text-black/50'}`}>
                            Driver Name
                          </label>
                          <Input
                            className="w-full"
                            value={data.driverName}
                            onChange={(e) => updateTruckData(data.truckId, 'driverName', e.target.value)}
                            placeholder="Enter driver name"
                            disabled={data.status === 'fetched' && data.driverName}
                          />
                        </div>
                        <div>
                          <label className={`text-xs font-medium mb-1 block ${currentTheme === 'dark' ? 'text-white/50' : 'text-black/50'}`}>
                            Company
                          </label>
                          <Input
                            className="w-full"
                            value={data.company}
                            onChange={(e) => updateTruckData(data.truckId, 'company', e.target.value)}
                            placeholder="Enter company"
                          />
                        </div>
                        {data.drivers && data.drivers.length > 1 ? (
                          <>
                            {data.drivers.map((driver, index) => (
                              <div key={driver.id || index}>
                                <label className={`text-xs font-medium mb-1 block ${currentTheme === 'dark' ? 'text-white/50' : 'text-black/50'}`}>
                                  {driver.full_name} Amount <span className="text-red-500">*</span>
                                </label>
                                <InputNumber
                                  className="w-full"
                                  value={driver.amount ? parseFloat(driver.amount) : null}
                                  onChange={(value) => {
                                    const updatedDrivers = [...(data.drivers || [])];
                                    updatedDrivers[index] = {
                                      ...updatedDrivers[index],
                                      amount: value === null || value === undefined ? '' : String(value),
                                    };
                                    const totalAmount = updatedDrivers.reduce((sum, d) => {
                                      const amt = parseFloat(d.amount) || 0;
                                      return sum + amt;
                                    }, 0);
                                    updateTruckData(data.truckId, 'drivers', updatedDrivers);
                                    updateTruckData(data.truckId, 'totalAmount', String(totalAmount));
                                  }}
                                  placeholder="Enter amount"
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
                                    color: (() => {
                                      const amt = parseFloat(driver.amount) || 0;
                                      if (amt < 0) return currentTheme === 'dark' ? '#f87171' : '#dc2626';
                                      if (amt > 0) return currentTheme === 'dark' ? '#4ade80' : '#16a34a';
                                      return currentTheme === 'dark' ? '#9ca3af' : '#6b7280';
                                    })(),
                                    width: '100%'
                                  }}
                                />
                              </div>
                            ))}
                            <div>
                              <label className={`text-xs font-medium mb-1 block ${currentTheme === 'dark' ? 'text-white/50' : 'text-black/50'}`}>
                                Total Amount <span className="text-red-500">*</span>
                              </label>
                              <InputNumber
                                className="w-full"
                                value={data.totalAmount ? parseFloat(data.totalAmount) : null}
                                disabled={true}
                                formatter={(value) => {
                                  if (!value && value !== 0) return '';
                                  const numValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]/g, '')) : value;
                                  if (isNaN(numValue)) return '';
                                  return `$ ${numValue}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                                }}
                                style={{
                                  color: (() => {
                                    const amt = parseFloat(data.totalAmount) || 0;
                                    if (amt < 0) return currentTheme === 'dark' ? '#f87171' : '#dc2626';
                                    if (amt > 0) return currentTheme === 'dark' ? '#4ade80' : '#16a34a';
                                    return currentTheme === 'dark' ? '#9ca3af' : '#6b7280';
                                  })(),
                                  width: '100%',
                                  backgroundColor: currentTheme === 'dark' ? 'rgba(255,255,255,0.05)' : '#f5f5f5'
                                }}
                              />
                            </div>
                          </>
                        ) : (
                          <div>
                            <label className={`text-xs font-medium mb-1 block ${currentTheme === 'dark' ? 'text-white/50' : 'text-black/50'}`}>
                              Total Amount <span className="text-red-500">*</span>
                            </label>
                            <InputNumber
                              className="w-full"
                              value={data.totalAmount ? parseFloat(data.totalAmount) : null}
                              onChange={(value) => {
                                if (value === null || value === undefined) {
                                  updateTruckData(data.truckId, 'totalAmount', '');
                                  return;
                                }
                                if (typeof value === 'number' && !isNaN(value)) {
                                  updateTruckData(data.truckId, 'totalAmount', String(value));
                                }
                              }}
                              placeholder="Enter amount"
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
                                color: (() => {
                                  const amt = parseFloat(data.totalAmount) || 0;
                                  if (amt < 0) return currentTheme === 'dark' ? '#f87171' : '#dc2626';
                                  if (amt > 0) return currentTheme === 'dark' ? '#4ade80' : '#16a34a';
                                  return currentTheme === 'dark' ? '#9ca3af' : '#6b7280';
                                })(),
                                width: '100%'
                              }}
                            />
                          </div>
                        )}
                        <div>
                          <label className={`text-xs font-medium mb-1 block ${currentTheme === 'dark' ? 'text-white/50' : 'text-black/50'}`}>
                            Escrow
                          </label>
                          <InputNumber
                            className="w-full"
                            value={data.escrow ? parseFloat(data.escrow) : null}
                            onChange={(value) => {
                              if (value === null || value === undefined) {
                                updateTruckData(data.truckId, 'escrow', '');
                                return;
                              }
                              if (typeof value === 'number' && !isNaN(value)) {
                                updateTruckData(data.truckId, 'escrow', String(value));
                              }
                            }}
                            placeholder="Enter escrow (can be positive or negative)"
                            step={0.01}
                            controls={true}
                            keyboard={true}
                            formatter={(value) => {
                              if (!value && value !== 0) return '';
                              const num = parseFloat(value);
                              if (isNaN(num)) return '';
                              const sign = num < 0 ? '-' : '';
                              const absValue = Math.abs(num);
                              return `${sign}$ ${absValue}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
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
                            style={{ color: currentTheme === 'dark' ? '#60a5fa' : '#2563eb', width: '100%' }}
                          />
                        </div>
                        {data.pdf && (
                          <div>
                            <label className={`text-xs font-medium mb-1 block ${currentTheme === 'dark' ? 'text-white/50' : 'text-black/50'}`}>
                              PDF Statement
                            </label>
                            <a
                              href={data.pdf}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`text-xs px-3 py-2 rounded border inline-block ${currentTheme === 'dark' ? 'border-white/20 text-white/70 hover:bg-white/10' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                              View PDF
                            </a>
                          </div>
                        )}
                        <div className="md:col-span-2">
                          <label className={`text-xs font-medium mb-1 block ${currentTheme === 'dark' ? 'text-white/50' : 'text-black/50'}`}>
                            Note
                          </label>
                          <TextArea
                            rows={2}
                            value={data.note}
                            onChange={(e) => updateTruckData(data.truckId, 'note', e.target.value)}
                            placeholder="Enter note"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className={`space-y-4 pt-6 border-t ${currentTheme === 'dark' ? 'border-white/10' : 'border-black/10'}`}>
            <h3 className={`text-sm font-bold flex items-center gap-2 ${currentTheme === 'dark' ? 'text-white/85' : 'text-black/85'
              }`}>
              <PlusOutlined style={{ fontSize: '16px', color: '#E77843' }} /> Add Available Fleet Unit
            </h3>

            <Select
              className="w-full"
              placeholder={!selectedOwner || !start_date || !end_date
                ? "Please select Fleet Owner and Date Range first"
                : "Search and select a unit..."}
              showSearch
              value={selectedUnitValue}
              options={Options}
              disabled={!selectedOwner || !start_date || !end_date}
              onChange={(value) => {
                setSelectedUnitValue(value);
                addTruck(value);
              }}
              filterOption={(input, option) => {
                const searchText = input.toLowerCase();
                const unitNumber = (option?.unitNumber || '').toLowerCase();
                const driverName = (option?.driverName || '').toLowerCase();
                return unitNumber.includes(searchText) || driverName.includes(searchText);
              }}
            />
          </section>
        </div>

        <div className={`px-6 py-4 border-t flex justify-end gap-3 ${currentTheme === 'dark' ? 'border-white/10 bg-white/5' : 'border-black/10 bg-gray-50'
          }`}>
          <Button onClick={handleClose} className="hover:border-[#F59A6B] hover:text-[#F59A6B]">
            Cancel
          </Button>
          <Button
            type="primary"
            onClick={handleFormSubmit}
            loading={isSubmitting}
            className="bg-[#E77843] hover:bg-[#F59A6B] border-[#E77843] hover:border-[#F59A6B]"
            icon={<SaveOutlined />}
          >
            Create Calculation
          </Button>
        </div>
      </div>
    </Drawer>
  );
};
