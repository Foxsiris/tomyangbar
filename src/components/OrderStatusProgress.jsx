import { motion } from 'framer-motion';
import { Clock, CheckCircle, Truck, XCircle, ChefHat } from 'lucide-react';

const OrderStatusProgress = ({ status, orderId, className = '' }) => {
  const statusSteps = [
    {
      id: 'pending',
      label: 'Ожидает',
      icon: Clock,
      color: 'yellow',
      description: 'Заказ принят и ожидает обработки'
    },
    {
      id: 'preparing',
      label: 'Готовится',
      icon: ChefHat,
      color: 'blue',
      description: 'Ваш заказ готовится'
    },
    {
      id: 'delivering',
      label: 'Доставляется',
      icon: Truck,
      color: 'purple',
      description: 'Заказ в пути к вам'
    },
    {
      id: 'completed',
      label: 'Завершен',
      icon: CheckCircle,
      color: 'green',
      description: 'Заказ успешно доставлен'
    },
    {
      id: 'cancelled',
      label: 'Отменен',
      icon: XCircle,
      color: 'red',
      description: 'Заказ был отменен'
    }
  ];

  const getCurrentStepIndex = () => {
    return statusSteps.findIndex(step => step.id === status);
  };

  const getStepColor = (stepIndex, currentStepIndex) => {
    if (stepIndex < currentStepIndex) {
      return 'bg-green-500 text-white';
    } else if (stepIndex === currentStepIndex) {
      const step = statusSteps[stepIndex];
      switch (step.color) {
        case 'yellow': return 'bg-yellow-500 text-white';
        case 'blue': return 'bg-blue-500 text-white';
        case 'purple': return 'bg-purple-500 text-white';
        case 'green': return 'bg-green-500 text-white';
        case 'red': return 'bg-red-500 text-white';
        default: return 'bg-gray-500 text-white';
      }
    } else {
      return 'bg-gray-200 text-gray-400';
    }
  };

  const getLineColor = (stepIndex, currentStepIndex) => {
    if (stepIndex < currentStepIndex) {
      return 'bg-green-500';
    } else {
      return 'bg-gray-200';
    }
  };

  const currentStepIndex = getCurrentStepIndex();
  const currentStep = statusSteps[currentStepIndex];

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 ${className}`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          Статус заказа #{orderId}
        </h3>
        <p className="text-sm text-gray-600">
          {currentStep?.description || 'Статус неизвестен'}
        </p>
      </div>

      {/* Progress Steps - горизонтальный скролл на мобильных, чтобы не выезжало за край */}
      <div className="relative -mx-2 sm:mx-0">
        <div className="overflow-x-auto px-2 sm:px-0 pb-1">
          {/* Progress Line */}
          <div className="relative">
            <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-200 min-w-[480px] sm:min-w-0">
              <motion.div
                className="h-full bg-green-500"
                initial={{ width: 0 }}
                animate={{ 
                  width: currentStepIndex >= 0 ? `${(currentStepIndex / (statusSteps.length - 1)) * 100}%` : '0%'
                }}
                transition={{ duration: 0.5, delay: 0.2 }}
              />
            </div>

            {/* Steps */}
            <div className="flex justify-between relative min-w-[480px] sm:min-w-0">
              {statusSteps.map((step, index) => {
                const Icon = step.icon;
                const isActive = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;
                
                return (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex flex-col items-center flex-shrink-0"
                  >
                    {/* Icon */}
                    <div className={`
                      w-12 h-12 rounded-full flex items-center justify-center mb-1 sm:mb-2 transition-all duration-300
                      ${getStepColor(index, currentStepIndex)}
                      ${isCurrent ? 'ring-4 ring-opacity-30' : ''}
                      ${isCurrent && step.color === 'yellow' ? 'ring-yellow-300' : ''}
                      ${isCurrent && step.color === 'blue' ? 'ring-blue-300' : ''}
                      ${isCurrent && step.color === 'purple' ? 'ring-purple-300' : ''}
                      ${isCurrent && step.color === 'green' ? 'ring-green-300' : ''}
                      ${isCurrent && step.color === 'red' ? 'ring-red-300' : ''}
                    `}>
                      <Icon className="w-6 h-6" />
                    </div>

                    {/* Label */}
                    <div className="text-center">
                      <p className={`text-xs sm:text-sm font-medium leading-tight ${
                        isActive ? 'text-gray-900' : 'text-gray-400'
                      }`}>
                        {step.label}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Current Status Info */}
      {currentStep && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="mt-6 p-4 rounded-lg bg-gray-50"
        >
          <div className="flex items-center">
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center mr-3
              ${getStepColor(currentStepIndex, currentStepIndex)}
            `}>
              <currentStep.icon className="w-4 h-4" />
            </div>
            <div>
              <p className="font-medium text-gray-900">
                {currentStep.label}
              </p>
              <p className="text-sm text-gray-600">
                {currentStep.description}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default OrderStatusProgress;
