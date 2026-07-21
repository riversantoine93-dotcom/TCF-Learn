"use client";
import Header from "@/components/Header";
import { useAuth } from "@/components/AuthProvider";
export default function Profile(){const {user}=useAuth();return <main><Header/><section className="shell profile"><span className="eyebrow">STUDENT PROFILE</span><h1>{user?.user_metadata?.full_name||"Guest student"}</h1><div className="profile-card"><p><b>Email</b><br/>{user?.email||"Sign in to connect a student account."}</p><p><b>Course access</b><br/>Turning Forward preview</p><p><b>Privacy</b><br/>Journal entries and answers are only available through your authenticated account and protected database policies.</p></div></section></main>}
