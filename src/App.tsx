import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

// Types
type TriggerType = "spend" | "specific-item";
type RewardType = "free-product" | "flat-discount";
type RuleTemplate = "specific-free-product" | "spend-flat-discount";

interface MilestoneRule {
  id: number;
  enabled: boolean;
  ruleName: string;
  ruleTemplate: RuleTemplate;
  triggerType: TriggerType;
  threshold: number;
  specificItem: string;
  rewardType: RewardType;
  rewardQuantity: number;
  productToComp: string;
  flatDiscountAmount: number;
  allowMultipleRedemptions: boolean;
}

const PRODUCT_OPTIONS = [
  "1-hour jump pass",
  "2-hour climb pass",
  "1-hour laser tag session",
  "Coffee",
  "Burger",
  "Hotdog",
  "T-shirt",
  "Socks",
];

function createDefaultRule(): MilestoneRule {
  return {
    id: 0,
    enabled: true,
    ruleName: "",
    ruleTemplate: "specific-free-product",
    triggerType: "specific-item",
    threshold: 10,
    specificItem: "1-hour jump pass",
    rewardType: "free-product",
    rewardQuantity: 1,
    productToComp: "1-hour jump pass",
    flatDiscountAmount: 10,
    allowMultipleRedemptions: false,
  };
}

function buildRuleSubtitle(rule: MilestoneRule): string {
  if (rule.ruleTemplate === "specific-free-product") {
    const quantity = rule.rewardQuantity > 1 ? `${rule.rewardQuantity} free` : "1 free";
    return `every ${rule.threshold} × ${rule.specificItem} → ${quantity} ${rule.productToComp}`;
  }

  if (rule.ruleTemplate === "spend-flat-discount") {
    return `$${rule.threshold} spent → $${rule.flatDiscountAmount} off`;
  }

  return "";
}

export default function App(): JSX.Element {
  // Program details
  const [programName, setProgramName] = useState("Sky Zone Milestones");
  const [programDescription, setProgramDescription] = useState("Milestone rewards for frequent jumpers.");
  const [enableMilestones, setEnableMilestones] = useState(true);

  // Rules
  const [rules, setRules] = useState<MilestoneRule[]>([]);
  const [nextRuleId, setNextRuleId] = useState(1);
  const [editingRuleId, setEditingRuleId] = useState<number | null>(null);
  const [editingDraft, setEditingDraft] = useState<MilestoneRule | null>(null);

  // Rule editor state
  const [showRuleEditor, setShowRuleEditor] = useState(false);

  // Expiry rules
  const [expiryValue, setExpiryValue] = useState(90);
  const [expiryUnit, setExpiryUnit] = useState<"days" | "months">("days");

  const startCreateRule = (): void => {
    const draft = createDefaultRule();
    setEditingRuleId(null);
    setEditingDraft(draft);
    setShowRuleEditor(true);
  };

  const startEditRule = (id: number): void => {
    const existing = rules.find((r) => r.id === id);
    if (!existing) return;
    setEditingRuleId(id);
    setEditingDraft({ ...existing });
    setShowRuleEditor(true);
  };

  const saveCurrentRule = (): void => {
    if (!editingDraft) return;
    const draft = { ...editingDraft };
    draft.threshold = Math.max(1, draft.threshold);
    draft.rewardQuantity = Math.max(1, draft.rewardQuantity);
    draft.flatDiscountAmount = Math.max(1, draft.flatDiscountAmount);
    draft.triggerType = draft.ruleTemplate === "specific-free-product" ? "specific-item" : "spend";
    draft.rewardType = draft.ruleTemplate === "specific-free-product" ? "free-product" : "flat-discount";
    if (!draft.ruleName.trim()) {
      draft.ruleName = "Untitled rule";
    }
    if (editingRuleId === null) {
      draft.id = nextRuleId;
      setNextRuleId(nextRuleId + 1);
      setRules([...rules, draft]);
    } else {
      setRules(rules.map((r) => (r.id === editingRuleId ? draft : r)));
    }
    setShowRuleEditor(false);
    setEditingRuleId(null);
    setEditingDraft(null);
  };

  const cancelEditRule = (): void => {
    setShowRuleEditor(false);
    setEditingRuleId(null);
    setEditingDraft(null);
  };

  const deleteRule = (id: number): void => {
    setRules(rules.filter((r) => r.id !== id));
    if (editingRuleId === id) {
      cancelEditRule();
    }
  };

  const toggleRuleEnabled = (id: number): void => {
    setRules(rules.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)));
  };

  const setRuleTemplate = (template: RuleTemplate): void => {
    if (!editingDraft) return;
    const shared = {
      ...editingDraft,
      ruleTemplate: template,
      triggerType: template === "specific-free-product" ? ("specific-item" as TriggerType) : ("spend" as TriggerType),
      rewardType: template === "specific-free-product" ? ("free-product" as RewardType) : ("flat-discount" as RewardType),
      allowMultipleRedemptions: editingDraft.allowMultipleRedemptions ?? false,
    };
    const updated =
      template === "specific-free-product"
        ? {
            ...shared,
            threshold: editingDraft.threshold || 10,
            rewardQuantity: editingDraft.rewardQuantity || 1,
            specificItem: editingDraft.specificItem || PRODUCT_OPTIONS[0],
            productToComp: editingDraft.productToComp || PRODUCT_OPTIONS[0],
          }
        : {
            ...shared,
            threshold: editingDraft.threshold || 500,
            flatDiscountAmount: editingDraft.flatDiscountAmount || 10,
          };

    setEditingDraft(updated);
  };

  return (
    <div className="min-h-screen bg-[#f4f5f7] flex">
      {/* Sidebar */}
      <aside className="w-[220px] bg-[#003e7f] text-[#f9fafb] flex flex-col p-4">
        <div className="flex items-center gap-2 px-2.5 py-2 pb-4 font-semibold text-sm">
          <div className="w-6 h-6 rounded bg-gradient-to-br from-[#ff6b35] to-[#ff2e63]"></div>
          <div>ROLLERWorld</div>
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-wider opacity-70 px-2.5 py-2 pt-1">Main</div>
          {["Dashboard", "Activity centre", "Bookings", "Products", "Guests", "Loyalty", "Reports", "Apps", "Settings"].map((item) => (
            <div
              key={item}
              className={`text-[13px] px-2.5 py-1.5 rounded ${item === "Loyalty" ? "bg-[#002c5a] font-medium" : ""}`}
            >
              {item}
            </div>
          ))}
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 md:p-10 overflow-x-auto">
        <header className="flex justify-between items-center mb-4">
          <div>
            <div className="text-xs text-gray-500 mb-1">Loyalty / Settings</div>
            <h1 className="text-[22px] font-semibold text-gray-900 m-0">Settings</h1>
          </div>
          <div className="flex gap-2 items-center">
            <Button variant="outline" className="rounded text-[13px] px-3.5 py-1.5 border-gray-300">
              Cancel
            </Button>
            <Button className="rounded text-[13px] px-3.5 py-1.5 bg-[#e11d48] hover:bg-[#d11a42] text-white font-medium">
              Save
            </Button>
          </div>
        </header>

        <div className="mb-6">
          <p className="text-[13px] text-gray-500 m-1 mt-0">
            Set up how guests earn and redeem milestone-based rewards in your loyalty program.
          </p>
        </div>

        {/* Program details */}
        <Card className="mb-6 rounded border border-gray-300 bg-white">
          <CardContent className="p-5 md:p-6">
            <h2 className="text-base font-semibold mb-3 m-0">Program details</h2>
            <div className="text-[13px] text-gray-500 mb-4">
              Basic details used across POS, Online Checkout and guest communications.
            </div>
            <div className="flex flex-col mb-3 max-w-[540px]">
              <Label htmlFor="program-name" className="text-[13px] mb-1">
                Name *
              </Label>
              <Input
                id="program-name"
                className="rounded border-gray-300 text-[13px] px-2 py-1.5 h-auto"
                value={programName}
                onChange={(e) => setProgramName(e.target.value)}
              />
            </div>
            <div className="flex flex-col mb-3 max-w-[540px]">
              <Label htmlFor="program-description" className="text-[13px] mb-1">
                Description
              </Label>
              <textarea
                id="program-description"
                className="rounded border border-gray-300 text-[13px] px-2 py-1.5 min-h-[64px] resize-y outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/25"
                placeholder="Optional description for internal use."
                value={programDescription}
                onChange={(e) => setProgramDescription(e.target.value)}
              />
            </div>
            <div className="flex flex-col mb-3">
              <Label className="text-[13px] flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={enableMilestones}
                  onChange={(e) => setEnableMilestones(e.target.checked)}
                  className="mr-1"
                />
                Enable milestone rewards for this venue
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Program rules */}
        <Card className="mb-6 rounded border border-gray-300 bg-white">
          <CardContent className="p-5 md:p-6">
            <h2 className="text-base font-semibold mb-3 m-0">Program rules</h2>
            <div className="text-[13px] text-gray-500 mb-4">
              Define which milestones exist, what reward they unlock, and how that reward can be used.
            </div>

            <div className="mb-3.5">
              <div className="flex flex-col items-start text-xs text-gray-500 mb-1">
                <span className="text-[13px] text-gray-900 font-medium">Milestone rules</span>
                <span className="text-[11px] text-gray-500">
                  Guests can progress toward each milestone rule independently.
                </span>
              </div>
              <div id="rule-list" className="mb-2">
                {rules.length === 0 ? (
                  <div className="text-xs text-gray-500 mb-2">No milestone rules configured yet.</div>
                ) : (
                  rules.map((rule) => (
                    <div
                      key={rule.id}
                      className={`flex items-center gap-2 px-2.5 py-1.5 mb-1 rounded border border-gray-200 bg-gray-50 text-[13px] ${
                        !rule.enabled ? "opacity-50" : ""
                      }`}
                    >
                      <Switch
                        checked={rule.enabled}
                        onCheckedChange={() => toggleRuleEnabled(rule.id)}
                        className="h-[18px] w-8"
                      />
                      <button
                        type="button"
                        className="flex-1 text-left border-none bg-transparent p-0 text-[13px] cursor-pointer"
                        onClick={() => startEditRule(rule.id)}
                      >
                        <span className="font-medium block">{rule.ruleName || "Untitled rule"}</span>
                        <span className="text-[11px] text-gray-500 block">
                          {buildRuleSubtitle(rule)}
                          {!rule.allowMultipleRedemptions && " • One redemption per transaction"}
                          {rule.allowMultipleRedemptions && " • Multiple redemptions allowed"}
                        </span>
                      </button>
                      <button
                        type="button"
                        className="border-none bg-transparent text-xs text-gray-500 cursor-pointer hover:text-red-700"
                        onClick={() => deleteRule(rule.id)}
                      >
                        Delete
                      </button>
                    </div>
                  ))
                )}
              </div>
              <Button
                variant="outline"
                className="rounded text-xs px-2.5 py-1 border-gray-300"
                onClick={startCreateRule}
              >
                + Add rule
              </Button>
            </div>

            {/* Rule editor */}
            {showRuleEditor && editingDraft && (
              <div className="mt-4 pt-4 border-t border-gray-200 mb-1">
                <div className="mb-3.5">
                  <div className="flex flex-col items-start text-xs text-gray-500 mb-1">
                    <span className="text-[13px] text-gray-900 font-medium">Rule name</span>
                    <span className="text-[11px] text-gray-500">
                      Used to identify this milestone rule in Venue Manager.
                    </span>
                  </div>
                  <Input
                    className="rounded border-gray-300 text-[13px] px-2 py-1.5 h-auto"
                    value={editingDraft.ruleName}
                    onChange={(e) => setEditingDraft({ ...editingDraft, ruleName: e.target.value })}
                  />
                </div>

                <div className="mb-3.5">
                  <div className="flex flex-col items-start text-xs text-gray-500 mb-1">
                    <span className="text-[13px] text-gray-900 font-medium">Choose a configuration</span>
                    <span className="text-[11px] text-gray-500">
                      Each option pairs a trigger with a reward type.
                    </span>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRuleTemplate("specific-free-product")}
                      className={`text-left rounded border px-3 py-3 transition shadow-sm ${
                        editingDraft.ruleTemplate === "specific-free-product"
                          ? "border-[#e11d48] bg-[#fff1f2]"
                          : "border-gray-300 bg-white hover:border-gray-400"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[13px] font-semibold text-gray-900">
                          Specific product/stock → Free product
                        </span>
                        {editingDraft.ruleTemplate === "specific-free-product" && (
                          <span className="text-[11px] text-[#e11d48] font-semibold">Selected</span>
                        )}
                      </div>
                      <p className="text-[12px] text-gray-600 m-0 mt-1">
                        Reward a free item after a guest books or buys a set number of a specific product or
                        stock item.
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRuleTemplate("spend-flat-discount")}
                      className={`text-left rounded border px-3 py-3 transition shadow-sm ${
                        editingDraft.ruleTemplate === "spend-flat-discount"
                          ? "border-[#e11d48] bg-[#fff1f2]"
                          : "border-gray-300 bg-white hover:border-gray-400"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[13px] font-semibold text-gray-900">
                          Spend threshold → Flat discount
                        </span>
                        {editingDraft.ruleTemplate === "spend-flat-discount" && (
                          <span className="text-[11px] text-[#e11d48] font-semibold">Selected</span>
                        )}
                      </div>
                      <p className="text-[12px] text-gray-600 m-0 mt-1">
                        Give a fixed dollar discount whenever a guest spends at least a set amount in a
                        milestone.
                      </p>
                    </button>
                  </div>
                </div>

                {editingDraft.ruleTemplate === "specific-free-product" && (
                  <>
                    <div className="mb-3.5">
                      <div className="flex flex-col items-start text-xs text-gray-500 mb-1">
                        <span className="text-[13px] text-gray-900 font-medium">Milestone trigger</span>
                        <span className="text-[11px] text-gray-500">
                          Guests unlock a reward after booking/purchasing a specific item.
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap text-[13px]">
                        <span>Guests unlock a milestone reward every</span>
                        <Input
                          type="number"
                          min={1}
                          step={1}
                          className="rounded border-gray-300 text-[13px] px-2 py-1.5 h-auto w-20"
                          value={editingDraft.threshold}
                          onChange={(e) =>
                            setEditingDraft({
                              ...editingDraft,
                              threshold: Math.max(1, parseInt(e.target.value, 10) || 0),
                            })
                          }
                        />
                        <span>×</span>
                        <select
                          className="rounded border border-gray-300 text-[13px] px-2 py-1.5 h-auto min-w-[140px] outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/25"
                          value={editingDraft.specificItem}
                          onChange={(e) =>
                            setEditingDraft({
                              ...editingDraft,
                              specificItem: e.target.value,
                            })
                          }
                        >
                          {PRODUCT_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="mb-3.5">
                      <div className="flex flex-col items-start text-xs text-gray-500 mb-1">
                        <span className="text-[13px] text-gray-900 font-medium">Reward configuration</span>
                        <span className="text-[11px] text-gray-500">
                          Decide how many free items guests receive.
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap text-[13px]">
                        <span>Guests get</span>
                        <Input
                          type="number"
                          min={1}
                          step={1}
                          className="rounded border-gray-300 text-[13px] px-2 py-1.5 h-auto w-20"
                          value={editingDraft.rewardQuantity}
                          onChange={(e) =>
                            setEditingDraft({
                              ...editingDraft,
                              rewardQuantity: Math.max(1, parseInt(e.target.value, 10) || 0),
                            })
                          }
                        />
                        <span>free</span>
                        <select
                          className="rounded border border-gray-300 text-[13px] px-2 py-1.5 h-auto min-w-[140px] outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/25"
                          value={editingDraft.productToComp}
                          onChange={(e) =>
                            setEditingDraft({
                              ...editingDraft,
                              productToComp: e.target.value,
                            })
                          }
                        >
                          {PRODUCT_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </>
                )}

                {editingDraft.ruleTemplate === "spend-flat-discount" && (
                  <>
                    <div className="mb-3.5">
                      <div className="flex flex-col items-start text-xs text-gray-500 mb-1">
                        <span className="text-[13px] text-gray-900 font-medium">Milestone trigger</span>
                        <span className="text-[11px] text-gray-500">
                          Guests unlock a reward after spending a set amount.
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap text-[13px]">
                        <span>Guests unlock a milestone reward every</span>
                        <span>$</span>
                        <Input
                          type="number"
                          min={1}
                          step={1}
                          className="rounded border-gray-300 text-[13px] px-2 py-1.5 h-auto w-24"
                          value={editingDraft.threshold}
                          onChange={(e) =>
                            setEditingDraft({
                              ...editingDraft,
                              threshold: Math.max(1, parseInt(e.target.value, 10) || 0),
                            })
                          }
                        />
                        <span>spent.</span>
                      </div>
                    </div>

                    <div className="mb-3.5">
                      <div className="flex flex-col items-start text-xs text-gray-500 mb-1">
                        <span className="text-[13px] text-gray-900 font-medium">Reward configuration</span>
                        <span className="text-[11px] text-gray-500">
                          Guests receive a fixed discount when the spend threshold is met.
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap text-[13px]">
                        <span>Guests receive</span>
                        <span>$</span>
                        <Input
                          type="number"
                          min={1}
                          step={1}
                          className="rounded border-gray-300 text-[13px] px-2 py-1.5 h-auto w-24"
                          value={editingDraft.flatDiscountAmount}
                          onChange={(e) =>
                            setEditingDraft({
                              ...editingDraft,
                              flatDiscountAmount: Math.max(1, parseInt(e.target.value, 10) || 0),
                            })
                          }
                        />
                        <span>off.</span>
                      </div>
                    </div>
                  </>
                )}

                <div className="mb-3.5">
                  <div className="flex flex-col items-start text-xs text-gray-500 mb-1">
                    <span className="text-[13px] text-gray-900 font-medium">Redemption quantity</span>
                    <span className="text-[11px] text-gray-500">
                      Control whether guests can redeem multiple available rewards in a single transaction.
                    </span>
                  </div>
                  <label className="flex items-start gap-2 text-[13px] text-gray-900">
                    <input
                      type="checkbox"
                      checked={editingDraft.allowMultipleRedemptions}
                      onChange={(e) =>
                        setEditingDraft({
                          ...editingDraft,
                          allowMultipleRedemptions: e.target.checked,
                        })
                      }
                      className="mt-1"
                    />
                    <div>
                      Allow multiple rewards in one redemption
                      <span className="block text-xs text-gray-500">
                        If unchecked, only one available reward can be applied per transaction.
                      </span>
                    </div>
                  </label>
                </div>

                <div className="flex gap-2 mt-2">
                  <Button
                    variant="outline"
                    className="rounded text-xs px-2.5 py-1 border-gray-300"
                    onClick={cancelEditRule}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="rounded text-xs px-2.5 py-1 bg-[#e11d48] hover:bg-[#d11a42] text-white"
                    onClick={saveCurrentRule}
                  >
                    Save rule
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expiry rules */}
        <Card className="mb-6 rounded border border-gray-300 bg-white">
          <CardContent className="p-5 md:p-6">
            <h2 className="text-base font-semibold mb-3 m-0">Expiry rules</h2>
            <div className="text-[13px] text-gray-500 mb-4">
              Configure how long milestone rewards remain valid once unlocked.
            </div>
            <div className="flex flex-col max-w-[540px]">
              <div className="flex items-center gap-2 flex-wrap text-[13px]">
                <span>Rewards expire</span>
                <Input
                  type="number"
                  min={1}
                  step={1}
                  className="rounded border-gray-300 text-[13px] px-2 py-1.5 h-auto w-20"
                  value={expiryValue}
                  onChange={(e) => setExpiryValue(parseInt(e.target.value) || 0)}
                />
                <select
                  className="rounded border border-gray-300 text-[13px] px-2 py-1.5 h-auto outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/25"
                  value={expiryUnit}
                  onChange={(e) => setExpiryUnit(e.target.value as "days" | "months")}
                >
                  <option value="days">days</option>
                  <option value="months">months</option>
                </select>
                <span>after they are unlocked.</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
