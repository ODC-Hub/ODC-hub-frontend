import { useTranslation } from 'react-i18next';

export default function ConfirmDialog(
    {
        open,
        onConfirm,
        onCancel,

    }: {
        open: boolean;
        onConfirm: () => void;
        onCancel: () => void;
        message: string;

    }
) {
    const { t } = useTranslation();

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/20 backdrop-blur-xs">
            <div className="bg-white rounded-2xl shadow-lg p-6 w-[90%] max-w-md text-center">
                <h2 className="text-lg font-semibold mb-4 text-gray-800">
                    Are you sure you want to reject this user?
                </h2>
                <div className="flex justify-center gap-4">
                    <button
                        onClick={onConfirm}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition"
                    >
                        Confirm
                    </button>
                    <button
                        onClick={onCancel}
                        className="bg-gray-200 hover:bg-gray-300 text-black px-4 py-2 rounded-md transition"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
