import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { createInvoice } from "@/redux/slices/invoicesSlice";
import { fetchSchoolSubscriptions } from "@/redux/slices/schoolSubscriptionsSlice";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { FileText, Plus, X } from "lucide-react";

interface LineItem {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateInvoiceModal: React.FC<CreateInvoiceModalProps> = ({
  isOpen,
  onClose,
}) => {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const { subscriptions } = useAppSelector(
    (state) => state.schoolSubscriptions
  );
  const { creating } = useAppSelector((state) => state.invoices);

  const [formData, setFormData] = useState({
    school: "",
    subscription: "",
    amount_due: "",
    currency: "KES",
    due_date: "",
    line_items: [] as LineItem[],
  });

  const [newLineItem, setNewLineItem] = useState({
    description: "",
    quantity: 1,
    unit_price: 0,
    total: 0,
  });

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchSchoolSubscriptions());
    }
  }, [isOpen, dispatch]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLineItemChange = (field: string, value: string | number) => {
    setNewLineItem((prev) => {
      const updated = { ...prev, [field]: value };
      // Calculate total
      if (field === "quantity" || field === "unit_price") {
        updated.total = updated.quantity * updated.unit_price;
      }
      return updated;
    });
  };

  const addLineItem = () => {
    if (
      newLineItem.description &&
      newLineItem.quantity > 0 &&
      newLineItem.unit_price > 0
    ) {
      setFormData((prev) => ({
        ...prev,
        line_items: [...prev.line_items, { ...newLineItem }],
      }));
      setNewLineItem({
        description: "",
        quantity: 1,
        unit_price: 0,
        total: 0,
      });
    }
  };

  const removeLineItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      line_items: prev.line_items.filter((_, i) => i !== index),
    }));
  };

  const calculateTotal = () => {
    return formData.line_items.reduce((sum, item) => sum + item.total, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.school ||
      !formData.subscription ||
      formData.line_items.length === 0
    ) {
      toast({
        title: "Validation Error",
        description:
          "Please fill in all required fields and add at least one line item.",
        variant: "destructive",
      });
      return;
    }

    try {
      const invoiceData = {
        ...formData,
        school: parseInt(formData.school),
        amount_due: calculateTotal().toString(),
      };

      await dispatch(createInvoice(invoiceData)).unwrap();

      toast({
        title: "Invoice Created",
        description: "Invoice has been created successfully.",
      });

      // Reset form
      setFormData({
        school: "",
        subscription: "",
        amount_due: "",
        currency: "KES",
        due_date: "",
        line_items: [],
      });

      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create invoice. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Create New Invoice
          </DialogTitle>
          <DialogDescription>
            Create a new invoice for a school subscription.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="school">School</Label>
              <Select
                value={formData.school}
                onValueChange={(value) => handleInputChange("school", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a school" />
                </SelectTrigger>
                <SelectContent>
                  {subscriptions.map((subscription) => (
                    <SelectItem
                      key={subscription.school}
                      value={subscription.school.toString()}
                    >
                      {subscription.school_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subscription">Subscription</Label>
              <Select
                value={formData.subscription}
                onValueChange={(value) =>
                  handleInputChange("subscription", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a subscription" />
                </SelectTrigger>
                <SelectContent>
                  {subscriptions
                    .filter((sub) => sub.school.toString() === formData.school)
                    .map((subscription) => (
                      <SelectItem key={subscription.id} value={subscription.id}>
                        {subscription.plan_name} - {subscription.billing_cycle}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => handleInputChange("currency", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="KES">KES (Kenyan Shilling)</SelectItem>
                  <SelectItem value="USD">USD (US Dollar)</SelectItem>
                  <SelectItem value="EUR">EUR (Euro)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="due_date">Due Date</Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) => handleInputChange("due_date", e.target.value)}
                required
              />
            </div>
          </div>

          {/* Line Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Line Items</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addLineItem}
                disabled={
                  !newLineItem.description ||
                  newLineItem.quantity <= 0 ||
                  newLineItem.unit_price <= 0
                }
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>

            {/* Add Line Item Form */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 p-4 border rounded-lg">
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={newLineItem.description}
                  onChange={(e) =>
                    handleLineItemChange("description", e.target.value)
                  }
                  placeholder="Item description"
                />
              </div>
              <div>
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={newLineItem.quantity}
                  onChange={(e) =>
                    handleLineItemChange("quantity", parseInt(e.target.value))
                  }
                />
              </div>
              <div>
                <Label htmlFor="unit_price">Unit Price</Label>
                <Input
                  id="unit_price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={newLineItem.unit_price}
                  onChange={(e) =>
                    handleLineItemChange(
                      "unit_price",
                      parseFloat(e.target.value)
                    )
                  }
                />
              </div>
              <div>
                <Label>Total</Label>
                <Input
                  value={newLineItem.total.toFixed(2)}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
            </div>

            {/* Line Items List */}
            {formData.line_items.length > 0 && (
              <div className="space-y-2">
                <Label>Added Items</Label>
                <div className="space-y-2">
                  {formData.line_items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="font-medium">{item.description}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.quantity} × {item.unit_price.toFixed(2)} ={" "}
                          {item.total.toFixed(2)}
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeLineItem(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Total */}
          <div className="flex justify-end">
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Total Amount</div>
              <div className="text-2xl font-bold">
                {formData.currency} {calculateTotal().toFixed(2)}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={creating || formData.line_items.length === 0}
            >
              {creating ? "Creating..." : "Create Invoice"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateInvoiceModal;
