import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

// Types
type MilestoneUnit = "product-bookings" | "stock-purchases" | "spend" | "specific-item";
type RewardType = "free-product" | "flat-discount" | "percent-off" | "points";
type EligibleMode = "all" | "selected";
type UnlockBehaviour = "same" | "next";

interface MilestoneRule {
  id: number;
  enabled: boolean;
  ruleName: string;
  threshold: number;
  unit: MilestoneUnit;
  specificItem: string;
  eligibleMode: EligibleMode;
  selectedCategories: string[];
  rewardType: RewardType;
  productToComp: string;
  flatDiscountAmount: number;
  percentOffValue: number;
  pointsValue: number;
}

const CATEGORY_OPTIONS: Record<string, string[]> = {
  "product-bookings": ["Session passes", "Day passes", "Party bookings", "Gift cards"],
  "stock-purchases": ["Merch", "Hot food", "Soft drinks", "Alcohol"],
};

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
    threshold: 10,
    unit: "product-bookings",
    specificItem: "1-hour jump pass",
    eligibleMode: "all",
    selectedCategories: [],
    rewardType: "free-product",
    productToComp: "1-hour jump pass",
    flatDiscountAmount: 10,
    percentOffValue: 20,
    pointsValue: 250,
  };
}

function buildRuleSubtitle(rule: MilestoneRule): string {
  let trigger = "";
  if (rule.unit === "spend") {
    trigger = `$${rule.threshold} spent in milestone`;
  } else if (rule.unit === "specific-item") {
    trigger = `every ${rule.threshold} × ${rule.specificItem}`;
  } else if (rule.unit === "product-bookings") {
    trigger = `every ${rule.threshold} product bookings`;
  } else if (rule.unit === "stock-purchases") {
    trigger = `every ${rule.threshold} stock purchases`;
  }

  let reward = "";
  if (rule.rewardType === "free-product") {
    reward = `get 1 free ${rule.productToComp}`;
  } else if (rule.rewardType === "flat-discount") {
    reward = `$${rule.flatDiscountAmount} off`;
  } else if (rule.rewardType === "percent-off") {
    reward = `${rule.percentOffValue}% off`;
  } else if (rule.rewardType === "points") {
    reward = `+${rule.pointsValue} points`;
  }

  return trigger && reward ? `${trigger} → ${reward}` : trigger || reward || "";
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
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");

  // Redemption rules
  const [unlockBehaviour, setUnlockBehaviour] = useState<UnlockBehaviour>("same");
  const [preventStacking, setPreventStacking] = useState(false);

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

  const getCategoryOptions = (): string[] => {
    if (!editingDraft) return [];
    return CATEGORY_OPTIONS[editingDraft.unit] || [];
  };

  const filteredCategories = getCategoryOptions().filter((cat) =>
    cat.toLowerCase().includes(categorySearch.toLowerCase())
  );

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
                        <span className="text-[11px] text-gray-500 block">{buildRuleSubtitle(rule)}</span>
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
                    <span className="text-[13px] text-gray-900 font-medium">Milestone trigger</span>
                    <span className="text-[11px] text-gray-500">
                      Choose the trigger and threshold for the reward.
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap text-[13px]">
                    <span className="text-[13px]">Guests unlock a milestone reward every</span>
                    <Input
                      type="number"
                      min={1}
                      step={1}
                      className="rounded border-gray-300 text-[13px] px-2 py-1.5 h-auto w-20"
                      value={editingDraft.threshold}
                      onChange={(e) =>
                        setEditingDraft({ ...editingDraft, threshold: parseInt(e.target.value) || 0 })
                      }
                    />
                    <select
                      className="rounded border border-gray-300 text-[13px] px-2 py-1.5 h-auto min-w-[140px] outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/25"
                      value={editingDraft.unit}
                      onChange={(e) =>
                        setEditingDraft({ ...editingDraft, unit: e.target.value as MilestoneUnit })
                      }
                    >
                      <option value="product-bookings">product bookings</option>
                      <option value="stock-purchases">stock purchases</option>
                      <option value="spend">$ spent in milestone</option>
                      <option value="specific-item">specific product or stock</option>
                    </select>
                  </div>
                  {editingDraft.unit === "specific-item" && (
                    <div className="flex flex-col mt-2 max-w-[540px]">
                      <Label htmlFor="specific-item-select" className="text-[13px] mb-1">
                        Product or stock that counts towards this milestone
                      </Label>
                      <select
                        id="specific-item-select"
                        className="rounded border border-gray-300 text-[13px] px-2 py-1.5 h-auto outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/25"
                        value={editingDraft.specificItem}
                        onChange={(e) =>
                          setEditingDraft({ ...editingDraft, specificItem: e.target.value })
                        }
                      >
                        {PRODUCT_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Eligible categories */}
                {(editingDraft.unit === "product-bookings" || editingDraft.unit === "stock-purchases") && (
                  <div className="mb-3.5">
                    <div className="flex flex-col items-start text-xs text-gray-500 mb-1">
                      <span className="text-[13px] text-gray-900 font-medium">Eligible categories</span>
                      <span className="text-[11px] text-gray-500">
                        Control which categories count towards the milestone.
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="flex items-start gap-1.5 text-[13px] text-gray-900">
                        <input
                          type="radio"
                          name="eligible-categories"
                          value="all"
                          checked={editingDraft.eligibleMode === "all"}
                          onChange={() => setEditingDraft({ ...editingDraft, eligibleMode: "all" })}
                          className="mt-1"
                        />
                        <div>
                          All categories
                          <span className="block text-xs text-gray-500">
                            Every category that matches your base earning rules contributes to the milestone.
                          </span>
                        </div>
                      </label>
                      <label className="flex items-start gap-1.5 text-[13px] text-gray-900">
                        <input
                          type="radio"
                          name="eligible-categories"
                          value="selected"
                          checked={editingDraft.eligibleMode === "selected"}
                          onChange={() => setEditingDraft({ ...editingDraft, eligibleMode: "selected" })}
                          className="mt-1"
                        />
                        <div>
                          Selected categories
                          <span className="block text-xs text-gray-500">
                            Only specific categories contribute (e.g. Session passes, Party bookings).
                          </span>
                        </div>
                      </label>
                    </div>
                    {editingDraft.eligibleMode === "selected" && (
                      <div className="mt-2 relative max-w-[360px]">
                        <button
                          type="button"
                          className="w-full px-2 py-1.5 rounded border border-gray-300 bg-white text-left text-[13px] text-gray-900 cursor-pointer focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:outline-offset-1"
                          onClick={() => setCategoriesOpen(!categoriesOpen)}
                        >
                          {editingDraft.selectedCategories.length === 0
                            ? "Select categories"
                            : editingDraft.selectedCategories.length === 1
                            ? editingDraft.selectedCategories[0]
                            : `${editingDraft.selectedCategories.length} categories selected`}
                        </button>
                        {categoriesOpen && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 shadow-lg rounded z-50 py-2">
                            <div className="flex items-center gap-2 px-3 pb-2 border-b border-gray-200">
                              <Input
                                className="flex-1 text-[13px] px-2 py-1 h-auto"
                                placeholder="Search categories"
                                value={categorySearch}
                                onChange={(e) => setCategorySearch(e.target.value)}
                              />
                              <button
                                type="button"
                                className="bg-transparent border-none text-[11px] text-gray-500 cursor-pointer px-0"
                                onClick={() => {
                                  setEditingDraft({ ...editingDraft, selectedCategories: [] });
                                  setCategorySearch("");
                                }}
                              >
                                Clear
                              </button>
                              <button
                                type="button"
                                className="bg-transparent border-none text-[11px] text-gray-500 cursor-pointer px-0"
                                onClick={() => {
                                  setEditingDraft({
                                    ...editingDraft,
                                    selectedCategories: [...getCategoryOptions()],
                                  });
                                }}
                              >
                                Select all
                              </button>
                            </div>
                            <div className="max-h-[220px] overflow-y-auto py-1">
                              {filteredCategories.map((cat) => (
                                <label
                                  key={cat}
                                  className="flex items-center gap-2 px-3 py-1 text-[13px] cursor-pointer hover:bg-gray-100"
                                >
                                  <input
                                    type="checkbox"
                                    checked={editingDraft.selectedCategories.includes(cat)}
                                    onChange={(e) => {
                                      const newCategories = e.target.checked
                                        ? [...editingDraft.selectedCategories, cat]
                                        : editingDraft.selectedCategories.filter((c) => c !== cat);
                                      setEditingDraft({ ...editingDraft, selectedCategories: newCategories });
                                    }}
                                  />
                                  <span>{cat}</span>
                                </label>
                              ))}
                            </div>
                            <div className="px-3 pt-2 border-t border-gray-200 flex justify-end">
                              <Button
                                className="px-3 py-1 text-xs bg-[#e11d48] hover:bg-[#d11a42] text-white"
                                onClick={() => setCategoriesOpen(false)}
                              >
                                Apply
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Reward configuration */}
                <div className="mb-3.5">
                  <div className="flex flex-col items-start text-xs text-gray-500 mb-1">
                    <span className="text-[13px] text-gray-900 font-medium">Reward configuration</span>
                    <span className="text-[11px] text-gray-500">
                      Choose what guests receive when they hit the milestone.
                    </span>
                  </div>
                  <div className="flex flex-col mb-0 max-w-[540px]">
                    <Label htmlFor="reward-type" className="text-[13px] mb-1">
                      Reward type
                    </Label>
                    <select
                      id="reward-type"
                      className="rounded border border-gray-300 text-[13px] px-2 py-1.5 h-auto outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/25"
                      value={editingDraft.rewardType}
                      onChange={(e) =>
                        setEditingDraft({ ...editingDraft, rewardType: e.target.value as RewardType })
                      }
                    >
                      <option value="free-product">Free product</option>
                      <option value="flat-discount">Flat discount reward</option>
                      <option value="percent-off">Percent-off discount</option>
                      <option value="points">Points</option>
                    </select>
                  </div>
                </div>

                {/* Reward configs */}
                {editingDraft.rewardType === "free-product" && (
                  <div className="mb-3.5">
                    <div className="flex flex-col items-start text-xs text-gray-500 mb-1">
                      <span className="text-[13px] text-gray-900 font-medium">Product to comp</span>
                      <span className="text-[11px] text-gray-500">
                        Guests will receive this product for free.
                      </span>
                    </div>
                    <select
                      className="rounded border border-gray-300 text-[13px] px-2 py-1.5 h-auto outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/25"
                      value={editingDraft.productToComp}
                      onChange={(e) =>
                        setEditingDraft({ ...editingDraft, productToComp: e.target.value })
                      }
                    >
                      {PRODUCT_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {editingDraft.rewardType === "flat-discount" && (
                  <div className="mb-3.5">
                    <div className="flex flex-col items-start text-xs text-gray-500 mb-1">
                      <span className="text-[13px] text-gray-900 font-medium">Flat discount amount</span>
                      <span className="text-[11px] text-gray-500">
                        Fixed value discount applied to the basket.
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap text-[13px]">
                      <span>Guests receive</span>
                      <span>$</span>
                      <Input
                        type="number"
                        min={1}
                        step={1}
                        className="rounded border-gray-300 text-[13px] px-2 py-1.5 h-auto w-20"
                        value={editingDraft.flatDiscountAmount}
                        onChange={(e) =>
                          setEditingDraft({
                            ...editingDraft,
                            flatDiscountAmount: parseInt(e.target.value) || 0,
                          })
                        }
                      />
                      <span>off their eligible purchase.</span>
                    </div>
                  </div>
                )}

                {editingDraft.rewardType === "percent-off" && (
                  <div className="mb-3.5">
                    <div className="flex flex-col items-start text-xs text-gray-500 mb-1">
                      <span className="text-[13px] text-gray-900 font-medium">Discount percentage</span>
                      <span className="text-[11px] text-gray-500">
                        Percentage discount applied to eligible items.
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap text-[13px]">
                      <span>Guests receive</span>
                      <Input
                        type="number"
                        min={1}
                        max={100}
                        step={1}
                        className="rounded border-gray-300 text-[13px] px-2 py-1.5 h-auto w-20"
                        value={editingDraft.percentOffValue}
                        onChange={(e) =>
                          setEditingDraft({
                            ...editingDraft,
                            percentOffValue: parseInt(e.target.value) || 0,
                          })
                        }
                      />
                      <span>% off.</span>
                    </div>
                  </div>
                )}

                {editingDraft.rewardType === "points" && (
                  <div className="mb-3.5">
                    <div className="flex flex-col items-start text-xs text-gray-500 mb-1">
                      <span className="text-[13px] text-gray-900 font-medium">Points</span>
                      <span className="text-[11px] text-gray-500">
                        Extra points credited when the milestone is reached.
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap text-[13px]">
                      <span>Guests earn an additional</span>
                      <Input
                        type="number"
                        min={1}
                        step={1}
                        className="rounded border-gray-300 text-[13px] px-2 py-1.5 h-auto w-20"
                        value={editingDraft.pointsValue}
                        onChange={(e) =>
                          setEditingDraft({
                            ...editingDraft,
                            pointsValue: parseInt(e.target.value) || 0,
                          })
                        }
                      />
                      <span>points.</span>
                    </div>
                  </div>
                )}

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

        {/* Redemption rules */}
        <Card className="mb-6 rounded border border-gray-300 bg-white">
          <CardContent className="p-5 md:p-6">
            <h2 className="text-base font-semibold mb-3 m-0">Redemption rules</h2>
            <div className="text-[13px] text-gray-500 mb-4">
              Control when and where milestone rewards can be redeemed.
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <p className="text-[13px] font-semibold mb-2 m-0">Unlock behaviour</p>
                <div className="mb-3.5">
                  <div className="flex flex-col items-start text-xs text-gray-500 mb-1">
                    <span className="text-[13px] text-gray-900 font-medium">
                      When can guests use this reward?
                    </span>
                    <span className="text-[11px] text-gray-500">
                      Applies to all rewards created by this milestone.
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="flex items-start gap-1.5 text-[13px] text-gray-900">
                      <input
                        type="radio"
                        name="unlock-behaviour"
                        value="same"
                        checked={unlockBehaviour === "same"}
                        onChange={() => setUnlockBehaviour("same")}
                        className="mt-1"
                      />
                      <div>
                        Allow reward on the qualifying transaction
                        <span className="block text-xs text-gray-500">
                          When the milestone is reached, staff can apply the reward to that basket (E3).
                        </span>
                      </div>
                    </label>
                    <label className="flex items-start gap-1.5 text-[13px] text-gray-900">
                      <input
                        type="radio"
                        name="unlock-behaviour"
                        value="next"
                        checked={unlockBehaviour === "next"}
                        onChange={() => setUnlockBehaviour("next")}
                        className="mt-1"
                      />
                      <div>
                        Only allow reward on a future transaction
                        <span className="block text-xs text-gray-500">
                          The milestone is unlocked now but can only be redeemed on the guest's next
                          eligible visit.
                        </span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-[13px] font-semibold mb-2 m-0">Advanced redemption settings</p>
                <div className="mb-3.5">
                  <div className="flex flex-col items-start text-xs text-gray-500 mb-1">
                    <span className="text-[13px] text-gray-900 font-medium">Discount behaviour</span>
                    <span className="text-[11px] text-gray-500">
                      Helps prevent over-discounting.
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="flex items-start gap-1.5 text-[13px] text-gray-900">
                      <input
                        type="checkbox"
                        checked={preventStacking}
                        onChange={(e) => setPreventStacking(e.target.checked)}
                        className="mt-1"
                      />
                      <div>
                        Prevent stacking with other discounts
                        <span className="block text-xs text-gray-500">
                          If another promotion is applied, milestone rewards are suppressed for that
                          transaction.
                        </span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
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

