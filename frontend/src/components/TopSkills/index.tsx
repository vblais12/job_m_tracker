import React, { useState } from 'react';
import { useTopSkills } from '../../hooks/useApi';
import { LoadingSpinner, ErrorAlert, ChartContainer } from '../common';
import type { SkillData } from '../../types/api';

interface TopSkillsProps {
  availableRoles?: string[];
}

export const TopSkills: React.FC<TopSkillsProps> = ({ availableRoles = [] }) => {
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [topK, setTopK] = useState(10);
  
  const { data, loading, error, refetch } = useTopSkills(selectedRole || undefined, topK);

  if (loading) {
    return <LoadingSpinner text="Loading skills data..." />;
  }

  if (error) {
    return <ErrorAlert message={error} onRetry={refetch} />;
  }

  if (!data) {
    return <ErrorAlert message="No skills data available" variant="warning" />;
  }

  // Parse skills data based on response format
  let skillsData: SkillData[] = [];
  let rolesData: Array<{ role: string; skills: SkillData[] }> = [];

  if (data.skills && Array.isArray(data.skills)) {
    if (selectedRole) {
      // Single role selected - extract skills from the response
      const roleSkills = data.skills[0];
      if (roleSkills && roleSkills.skills && Array.isArray(roleSkills.skills)) {
        skillsData = roleSkills.skills;
      } else if (Array.isArray(roleSkills)) {
        skillsData = roleSkills.map((item: any) => ({
          skill: item.skill || item[0] || 'Unknown',
          freq: item.freq || item[1] || 0
        }));
      }
    } else {
      // All roles - organize by role
      data.skills.forEach((roleData: any) => {
        if (roleData.search_query && roleData.skills) {
          rolesData.push({
            role: roleData.search_query,
            skills: Array.isArray(roleData.skills) ? roleData.skills : []
          });
        }
      });
      
      // Aggregate all skills for overview
      const skillsMap = new Map<string, number>();
      rolesData.forEach(roleData => {
        roleData.skills.forEach(skill => {
          const current = skillsMap.get(skill.skill) || 0;
          skillsMap.set(skill.skill, current + skill.freq);
        });
      });
      
      skillsData = Array.from(skillsMap.entries())
        .map(([skill, freq]) => ({ skill, freq }))
        .sort((a, b) => b.freq - a.freq)
        .slice(0, topK);
    }
  }

  const controls = (
    <div className="d-flex gap-3">
      <div className="d-flex align-items-center">
        <label htmlFor="role-select" className="form-label me-2 mb-0">Role:</label>
        <select
          id="role-select"
          className="form-select form-select-sm"
          style={{ minWidth: '150px' }}
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
        >
          <option value="">All Roles</option>
          {availableRoles.map(role => (
            <option key={role} value={role}>{role}</option>
          ))}
        </select>
      </div>
      <div className="d-flex align-items-center">
        <label htmlFor="topk-select" className="form-label me-2 mb-0">Show:</label>
        <select
          id="topk-select"
          className="form-select form-select-sm"
          value={topK}
          onChange={(e) => setTopK(Number(e.target.value))}
        >
          <option value={5}>Top 5</option>
          <option value={10}>Top 10</option>
          <option value={15}>Top 15</option>
          <option value={20}>Top 20</option>
        </select>
      </div>
    </div>
  );

  return (
    <div className="row g-4">
      {/* Skills Chart */}
      <div className="col-12">
        <ChartContainer 
          title={selectedRole ? `Top Skills for ${selectedRole}` : 'Top Skills Across All Roles'}
          actions={controls}
        >
          {skillsData.length > 0 ? (
            <div className="row">
              {skillsData.map((skill, index) => {
                const maxFreq = Math.max(...skillsData.map(s => s.freq));
                const percentage = maxFreq > 0 ? (skill.freq / maxFreq) * 100 : 0;
                const colors = [
                  'primary', 'success', 'info', 'warning', 'danger',
                  'secondary', 'dark'
                ];
                const colorClass = colors[index % colors.length];
                
                return (
                  <div key={skill.skill} className="col-md-6 col-lg-4 mb-3">
                    <div className="card border-0 bg-light">
                      <div className="card-body p-3">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <h6 className="card-title mb-0">{skill.skill}</h6>
                          <span className={`badge bg-${colorClass}`}>#{index + 1}</span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <small className="text-muted">Frequency</small>
                          <strong>{skill.freq}</strong>
                        </div>
                        <div className="progress" style={{ height: '6px' }}>
                          <div
                            className={`progress-bar bg-${colorClass}`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-muted py-5">
              <i className="fas fa-code fa-3x mb-3"></i>
              <p>No skills data available for the selected criteria</p>
            </div>
          )}
        </ChartContainer>
      </div>

      {/* Skills by Role (when no role selected) */}
      {!selectedRole && rolesData.length > 0 && (
        <div className="col-12">
          <ChartContainer title="Top Skills by Role">
            <div className="row">
              {rolesData.slice(0, 6).map((roleData) => (
                <div key={roleData.role} className="col-md-6 col-lg-4 mb-4">
                  <div className="card h-100">
                    <div className="card-header bg-primary text-white">
                      <h6 className="card-title mb-0">{roleData.role}</h6>
                    </div>
                    <div className="card-body">
                      <div className="list-group list-group-flush">
                        {roleData.skills.slice(0, 5).map((skill) => (
                          <div key={skill.skill} className="list-group-item d-flex justify-content-between align-items-center px-0 py-2 border-0">
                            <span className="fw-medium">{skill.skill}</span>
                            <span className="badge bg-secondary rounded-pill">{skill.freq}</span>
                          </div>
                        ))}
                      </div>
                      {roleData.skills.length > 5 && (
                        <button 
                          className="btn btn-outline-primary btn-sm mt-2 w-100"
                          onClick={() => setSelectedRole(roleData.role)}
                        >
                          View All Skills
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ChartContainer>
        </div>
      )}
    </div>
  );
};