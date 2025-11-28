import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import VendorReplyHeader from "../components/vendor-reply/VendorReplyHeader";
import VendorReplyTable from "../components/vendor-reply/VendorReplyTable";
import VendorReplyMessage from "../components/vendor-reply/VendorReplyMessage";
import VendorReplyFooter from "../components/vendor-reply/VendorReplyFooter";
import VendorReplySummary from "../components/vendor-reply/VendorReplySummary";
import VendorReplyLoading from "../components/vendor-reply/VendorReplyLoading";
import VendorReplyInvalid from "../components/vendor-reply/VendorReplyInvalid";
import VendorReplySubmitButton from "../components/vendor-reply/VendorReplySubmitButton";
import VendorReplySuccess from "../components/vendor-reply/VendorReplySuccess";

const VendorReplyPage: React.FC = () => {
  const { rfqId, token } = useParams<{ rfqId: string; token: string }>();

  const [items, setItems] = useState<any[]>([]);
  const [fields, setFields] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionData, setSubmissionData] = useState<{
    itemsProcessed: number;
    filesUploaded: number;
  }>({ itemsProcessed: 0, filesUploaded: 0 });
  const [deliveryCharges, setDeliveryCharges] = useState("");
  const [discount, setDiscount] = useState("");
  const [summaryNotes, setSummaryNotes] = useState("");

  useEffect(() => {
    if (!rfqId || !token) return;
    const fetchItems = async () => {
      try {
        setIsLoading(true);
        // Call the getItems API from vendors.controller.ts
        const res = await fetch(
          `https://mace-construction-production-82bc.up.railway.app/api/vendors/get-items/${rfqId}/${token}`
        );
        const data = await res.json();
        if (res.ok && Array.isArray(data.items)) {
          // Convert Vendors to string[] if it's a string
          const normalizedItems = data.items.map((item: any) => ({
            ...item,
            Vendors: Array.isArray(item.Vendors)
              ? item.Vendors
              : typeof item.Vendors === "string"
              ? item.Vendors.split(",").map((v: string) => v.trim())
              : [],
          }));
          setItems(normalizedItems);
          setFields(
            normalizedItems.map((item: any) => ({
              price: "",
              lead_time: "",
              notes: "",
              substitutions: "",
              file_link: "",
              quantity: item["Quantity"] || "",
            }))
          );
        } else {
          setMessage(data.error || "❌ Failed to fetch items");
        }
      } catch (err) {
        setMessage("❌ Failed to fetch items");
      } finally {
        setIsLoading(false);
      }
    };
    fetchItems();
  }, [rfqId, token]);

  const handleFieldChange = (idx: number, field: string, value: string) => {
    setFields((prev) => {
      const updated = [...prev];
      updated[idx][field] = value;
      return updated;
    });
  };

  const handleFileChange = (idx: number, file: File | null) => {
    setFields((prev) => {
      const updated = [...prev];
      updated[idx].file = file; // Store the actual File object
      updated[idx].file_link = file ? file.name : "";
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Create FormData for file uploads
      const formData = new FormData();

      // Prepare itemReplies with all the data
      const itemReplies = items.map((item, index) => {
        // Convert lead time to UTC Date to avoid timezone issues
        let leadTimeUTC = "";
        if (fields[index]?.lead_time) {
          const dateString = fields[index].lead_time;
          leadTimeUTC = new Date(`${dateString}T00:00:00.000Z`).toISOString();
        }

        return {
          itemName: item["Item Name"] || `Item ${index + 1}`,
          pricing: fields[index]?.price || "",
          leadTime: leadTimeUTC,
          notes: fields[index]?.notes || "",
          substitutions: fields[index]?.substitutions || "",
        };
      });

      // Add JSON data to FormData
      formData.append("itemReplies", JSON.stringify(itemReplies));
      formData.append("deliveryCharges", deliveryCharges);
      formData.append("discount", discount);
      formData.append("summaryNotes", summaryNotes);

      // Add files to FormData
      fields.forEach((field, index) => {
        if (field?.file) {
          formData.append(`files_${index}`, field.file);
        }
      });

      const res = await fetch(
        `https://mace-construction-production-82bc.up.railway.app/api/vendors/vendor-reply/${rfqId}/${token}`,
        {
          method: "POST",
          body: formData, // Use FormData instead of JSON
          // Don't set Content-Type header - let browser set it with boundary for multipart/form-data
        }
      );
      const data = await res.json();
      if (res.ok) {
        setSubmissionData({
          itemsProcessed: data.itemsProcessed || 0,
          filesUploaded: data.filesUploaded || 0,
        });
        setIsSubmitted(true);
      } else {
        setMessage(`❌ Error: ${data.error || "Submission failed"}`);
      }
    } catch (err) {
      setMessage("❌ Network error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!rfqId || !token) {
    return <VendorReplyInvalid />;
  }

  if (isLoading) {
    return <VendorReplyLoading />;
  }

  if (isSubmitted) {
    return (
      <VendorReplySuccess
        itemsProcessed={submissionData.itemsProcessed}
        filesUploaded={submissionData.filesUploaded}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <VendorReplyHeader rfqId={rfqId} />
        {/* Main Form */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white shadow-lg rounded-2xl border border-gray-100 p-6 lg:p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 mb-8">
            <VendorReplyTable
              items={items}
              fields={fields}
              handleFieldChange={handleFieldChange}
              handleFileChange={handleFileChange}
            />
          </div>
          {/* Summary Section */}
          <VendorReplySummary
            fields={fields}
            deliveryCharges={deliveryCharges}
            discount={discount}
            notes={summaryNotes}
            onChange={(field, value) => {
              if (field === "deliveryCharges") setDeliveryCharges(value);
              else if (field === "discount") setDiscount(value);
              else if (field === "notes") setSummaryNotes(value);
            }}
          />
          {/* Submit Button */}
          {items.length > 0 && (
            <div className="mt-8">
              <VendorReplySubmitButton isSubmitting={isSubmitting} />
            </div>
          )}
        </form>

        {/* Message Display */}
        <VendorReplyMessage message={message} />

        {/* Custom Footer */}
        <div className="mt-10 mb-4 text-center">
          <div className="text-base font-medium text-gray-700 mb-2">
            Need help?{" "}
            <a
              href="mailto:rfq@maceinfo.com"
              className="text-[#033159] underline"
            >
              Contact rfq@maceinfo.com
            </a>
          </div>
          <div className="text-xs text-gray-500 font-medium">
            Privacy note: Your reply will be visible only to the customer and
            Mace admin.
          </div>
        </div>

        {/* Footer */}
        <VendorReplyFooter />
      </div>
    </div>
  );
};

export default VendorReplyPage;
