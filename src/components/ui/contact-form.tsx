import React, { useState } from "react";
import { CheckCircle2 } from "lucide-react";

export default function ContactForm() {
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        
        // Simuleer een API call naar een email service (zoals Formspree of een eigen backend)
        // In een productieomgeving zou hier de echte POST request komen naar info@webgen.nu
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        setLoading(false);
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <div className="py-24 px-8 text-center space-y-6 animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-3xl font-serif italic text-gray-900">Bericht verzonden!</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                    Bedankt voor uw bericht. We hebben uw aanvraag ontvangen op <span className="font-bold text-gray-900 text-blue-600">info@webgen.nu</span> en nemen zo snel mogelijk contact met u op.
                </p>
                <button 
                    onClick={() => setSubmitted(false)}
                    className="px-8 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all active:scale-95"
                >
                    Nieuw bericht
                </button>
            </div>
        );
    }

    return (
        <main className="py-14">
            <div className="max-w-screen-xl mx-auto px-4 text-gray-600 md:px-8">
                <div className="max-w-lg mx-auto space-y-3 sm:text-center">
                    <h3 className="text-blue-600 font-semibold uppercase tracking-widest text-sm">
                        Contact
                    </h3>
                    <p className="text-gray-800 text-3xl font-semibold sm:text-4xl">
                        Nieuwsgierig naar de mogelijkheden?
                    </p>
                    <p>
                        Heeft u een vraag of wilt u een aanvraag doen voor een website? Laat uw bericht achter. We nemen zo snel als mogelijk contact op.
                    </p>
                </div>
                <div className="mt-12 max-w-lg mx-auto">
                    <form
                        onSubmit={handleSubmit}
                        className="space-y-5"
                    >
                        <div className="flex flex-col items-center gap-y-5 gap-x-6 [&>*]:w-full sm:flex-row">
                            <div>
                                <label className="font-medium text-gray-900">
                                    Voornaam
                                </label>
                                <input
                                    type="text"
                                    required
                                    className="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-blue-600 shadow-sm rounded-xl transition-all"
                                />
                            </div>
                            <div>
                                <label className="font-medium text-gray-900">
                                    Achternaam
                                </label>
                                <input
                                    type="text"
                                    required
                                    className="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-blue-600 shadow-sm rounded-xl transition-all"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="font-medium text-gray-900">
                                E-mail
                            </label>
                            <input
                                type="email"
                                required
                                className="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-blue-600 shadow-sm rounded-xl transition-all"
                            />
                        </div>
                        <div>
                            <label className="font-medium text-gray-900">
                                Telefoonnummer
                            </label>
                            <div className="relative mt-2">
                                <div className="absolute inset-y-0 left-3 my-auto h-6 flex items-center border-r pr-2 border-gray-200">
                                    <select className="text-sm bg-transparent outline-none rounded-lg h-full">
                                        <option>NL</option>
                                        <option>BE</option>
                                        <option>DE</option>
                                    </select>
                                </div>
                                <input
                                    type="tel"
                                    placeholder="+31 6 00000000"
                                    required
                                    className="w-full pl-[4.5rem] pr-3 py-2 appearance-none bg-transparent outline-none border focus:border-blue-600 shadow-sm rounded-xl transition-all"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="font-medium text-gray-900">
                                Bericht
                            </label>
                            <textarea required className="w-full mt-2 h-36 px-3 py-2 resize-none appearance-none bg-transparent outline-none border focus:border-blue-600 shadow-sm rounded-xl transition-all"></textarea>
                        </div>
                        <button
                            disabled={loading}
                            className={`w-full px-4 py-3 text-white font-bold bg-blue-600 hover:bg-blue-500 active:bg-blue-700 rounded-xl duration-150 shadow-lg shadow-blue-200 flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Bezig met verzenden...
                                </>
                            ) : 'Verstuur bericht'}
                        </button>
                    </form>
                </div>
            </div>
        </main>
    );
}
