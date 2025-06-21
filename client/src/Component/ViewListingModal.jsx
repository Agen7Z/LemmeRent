// components/ViewListingModal.jsx
import React from "react";
import Modal from "./Modal";

export default function ViewListingModal({ isOpen, onClose, selectedListing }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-xl font-semibold mb-4">Listing Details</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <p className="mt-1 text-gray-900">{selectedListing?.name}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Address</label>
          <p className="mt-1 text-gray-900">{selectedListing?.address}</p>
        </div>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}