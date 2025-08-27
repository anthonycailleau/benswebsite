import { useState, useEffect } from 'react';
import './Contact.scss';

const Contact = () => {

    const toggleLanguage = () => {
        setIsEnglish(prev => !prev);
    };
    // Traduction
    const [isEnglish, setIsEnglish] = useState(false);

    // Déclaration des états pour la soumission du formulaire
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        message: '',
    });
    const [status, setStatus] = useState(null);
    const [showModal, setShowModal] = useState(false);

    // Mise à jour des champs du formulaire
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Gestion de l'envoi du formulaire
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('/api/send-mail', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (data.success) {
                setStatus('success');
                setFormData({ firstName: '', lastName: '', email: '', message: '' });
                setShowModal(true); // ✅ ici la modale va s'afficher
            } else {
                setStatus('error');
            }
        } catch (err) {
            console.error('Erreur:', err);
            setStatus('error');
        }
    };

    // Réinitialise le statut après 3 secondes
    useEffect(() => {
        if (status) {
            const timer = setTimeout(() => setStatus(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [status]);
    useEffect(() => {
        document.body.classList.add('no-scroll');
        return () => {
            document.body.classList.remove('no-scroll');
        };
    }, []);
    const closeModal = () => {
        setShowModal(false);
    }
    return (
        <section id='contact'>
            <div className='contact-container'>
                <div className='contact-header'>
                    <div
                        className="contact-picture blurred"
                        style={{
                            backgroundImage: `url('/contact.jpg')`,
                        }}
                    />
                    <div className='contact-header-mobile-landscape'>
                        <div className='contact-picture'>
                            {/* <img src="contact_carré.png" alt="photo de Ben Bridgen avec une guitare" /> */}
                        </div>

                        <div className='contact-titles'>
                            <div className='contact-title'>
                                <h1>contact</h1>
                            </div>
                            <div className='contact-line'></div>
                            <div className='contact-title-description' onClick={toggleLanguage} style={{ cursor: 'pointer' }}>
                                <h5>{isEnglish ? 'Cliquez ici pour la version française' : 'Click here for the english version' }</h5>
                                <img src={isEnglish ? "french-logo.png" : "english-logo.png"} alt="toggle language" />
                            </div>
                        </div>

                    </div>
                </div>
                <div className='contact-main'>
                    <div className="contact-content">
                        <div className="contact-form">
                            <form onSubmit={handleSubmit}>
                                <div>
                                    <label htmlFor="firstName">{isEnglish ? 'First Name' : 'Prénom'}</label>
                                    <input
                                        type="text"
                                        id="firstName"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        placeholder={isEnglish ? 'First Name' : 'Prénom'}
                                        required
                                    />

                                    <label htmlFor="lastName">{isEnglish ? 'Last Name' : 'Nom'}</label>
                                    <input
                                        type="text"
                                        id="lastName"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        placeholder={isEnglish ? 'Last Name' : 'Nom'}
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="email">Email</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Email"
                                        required
                                    />

                                    <label htmlFor="message">{isEnglish ? 'Your Message' : 'Votre message'}</label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        rows="4"
                                        value={formData.message}
                                        onChange={handleChange}
                                        placeholder={isEnglish ? 'Your message...' : 'Votre message...'}
                                        required
                                    />
                                </div>

                                <button type="submit">{isEnglish ? 'Send' : 'Envoyer'}</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modale */}
            {showModal && (
                <div className='modal-overlay' onClick={closeModal}>
                    <div className='modal'>
                        <h4>{isEnglish ? 'Message sent successfully!' : 'Message envoyé avec succès !'}</h4>
                        <button onClick={closeModal}>{isEnglish ? 'Close' : 'Fermer'}</button>
                    </div>
                </div>
            )}
        </section>

    );
};

export default Contact; 