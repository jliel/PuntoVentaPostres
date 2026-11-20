import React from 'react';
import { X, CheckCircle2, ChefHat, Truck, MapPin, RefreshCw } from 'lucide-react';
import { Order, OrderStatus, Language } from '../types';

interface OrderTrackerModalProps {
  order: Order | null;
  onClose: () => void;
  onUpdateStatus: (orderId: string, nextStatus: OrderStatus) => void;
  language: Language;
}

export const OrderTrackerModal: React.FC<OrderTrackerModalProps> = ({
  order,
  onClose,
  onUpdateStatus,
  language,
}) => {
  if (!order) return null;

  const getStatusIndex = (status: OrderStatus) => {
    switch (status) {
      case 'received':
        return 0;
      case 'preparing':
        return 1;
      case 'ready':
        return 2;
      case 'completed':
        return 3;
      default:
        return 0;
    }
  };

  const currentIndex = getStatusIndex(order.status);

  const handleAdvance = () => {
    const statuses: OrderStatus[] = ['received', 'preparing', 'ready', 'completed'];
    const nextIdx = Math.min(statuses.length - 1, currentIndex + 1);
    onUpdateStatus(order.id, statuses[nextIdx]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-5 sm:p-6 animate-in fade-in zoom-in-95 duration-200 border border-stone-200/80">
        <div className="flex items-center justify-between pb-4 border-b border-stone-200">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#2C592E]">
              {language === 'es' ? 'Rastreo de Pedido en Vivo' : 'Live Order Tracker'}
            </span>
            <h3 className="font-heading text-lg font-bold text-stone-900">
              Postresito #{order.orderNumber}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition cursor-pointer"
            aria-label="Cerrar rastreador"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Map / Courier Simulation Box */}
        <div className="my-4 rounded-2xl bg-stone-900 p-4 text-white relative overflow-hidden border border-stone-800 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#8DD691] animate-ping" />
              <span className="text-xs font-bold text-[#8DD691]">
                {language === 'es' ? 'Conexión GPS en Vivo' : 'Live GPS Connection'}
              </span>
            </div>
            <span className="text-xs font-mono text-[#BED966] font-bold">ETA: 18 mins</span>
          </div>

          <div className="space-y-1 text-xs">
            <p className="text-stone-300 font-medium flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#BED966]" />
              <span>
                {language === 'es' ? 'Destino: ' : 'Destination: '}
                {order.customer.address || (language === 'es' ? 'Recoger en mostrador' : 'Pickup counter')}
              </span>
            </p>
            <p className="text-stone-400 text-[11px]">
              {language === 'es' ? 'Cliente: ' : 'Customer: '}{order.customer.name} ({order.customer.phone})
            </p>
          </div>

          {/* Test Simulation trigger for user */}
          <div className="mt-4 pt-3 border-t border-stone-800 flex items-center justify-between">
            <span className="text-[10px] text-stone-400">
              {language === 'es' ? 'Avanzar estado para pruebas:' : 'Advance step for testing:'}
            </span>
            <button
              onClick={handleAdvance}
              disabled={currentIndex >= 3}
              className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 rounded-lg text-[11px] font-semibold text-[#8DD691] flex items-center gap-1 transition disabled:opacity-40 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>{language === 'es' ? 'Siguiente Paso' : 'Next Step'}</span>
            </button>
          </div>
        </div>

        {/* Timeline Steps */}
        <div className="space-y-4 my-5 pl-2">
          {/* Step 0 */}
          <div className="flex items-start gap-3">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                currentIndex >= 0 ? 'bg-[#2C592E] text-white shadow-xs' : 'bg-stone-200 text-stone-400'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-stone-900">
                {language === 'es' ? 'Pedido Recibido y Pagado' : 'Order Received & Paid'}
              </h4>
              <p className="text-[11px] text-stone-500">
                {language === 'es' ? 'Transmitido a cocina a las ' : 'Transmitted to kitchen at '}{order.createdAt}
              </p>
            </div>
          </div>

          {/* Step 1 */}
          <div className="flex items-start gap-3">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                currentIndex >= 1 ? 'bg-[#2C592E] text-white ring-4 ring-[#BED966]/40 animate-pulse' : 'bg-stone-200 text-stone-400'
              }`}
            >
              <ChefHat className="w-4 h-4 text-[#BED966]" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-stone-900">
                {language === 'es' ? 'Preparando al Momento en Cocina' : 'Preparing Fresh in Kitchen'}
              </h4>
              <p className="text-[11px] text-stone-500">
                {language === 'es'
                  ? 'Nuestro cocinero prepara tus platillos calientes con ingredientes frescos'
                  : 'Freshly crafting your dishes with top ingredients'}
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-3">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                currentIndex >= 2 ? 'bg-[#2C592E] text-white shadow-xs' : 'bg-stone-200 text-stone-400'
              }`}
            >
              <Truck className="w-4 h-4 text-[#8DD691]" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-stone-900">
                {order.fulfillmentType === 'delivery'
                  ? (language === 'es' ? 'Repartidor en Camino' : 'Out for Delivery')
                  : (language === 'es' ? 'Listo en Mostrador' : 'Ready at Counter')}
              </h4>
              <p className="text-[11px] text-stone-500">
                {order.fulfillmentType === 'delivery'
                  ? (language === 'es' ? 'El repartidor va hacia tu domicilio' : 'Courier is heading to your address')
                  : (language === 'es' ? 'Por favor muestra tu número de orden al recoger' : 'Show order number at counter')}
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-3">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                currentIndex >= 3 ? 'bg-[#2C592E] text-white shadow-xs' : 'bg-stone-200 text-stone-400'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-stone-900">
                {language === 'es' ? 'Pedido Entregado' : 'Order Completed'}
              </h4>
              <p className="text-[11px] text-stone-500">
                {language === 'es' ? '¡Que disfrutes tu comida y postres! Gracias por elegir Postresito.' : 'Enjoy your meal and treats! Thank you for choosing Postresito.'}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-[#2C592E] hover:bg-[#224424] text-white text-xs font-bold transition cursor-pointer"
        >
          {language === 'es' ? 'Cerrar Rastreador' : 'Close Tracker'}
        </button>
      </div>
    </div>
  );
};
